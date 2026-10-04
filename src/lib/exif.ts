// Reads photo metadata (EXIF, GPS, XMP, IPTC…) and strips it losslessly from
// JPEG, PNG and WebP files by removing the metadata blocks themselves.
import {
  type ContainerFormat,
  ascii,
  concat,
  detectContainer,
  jpegSegments,
  pngChunks,
  webpChunks,
  webpFile,
} from "@/lib/image-containers";

export type MetadataField = { group: "Camera" | "Photo" | "Location" | "File"; label: string; value: string };

export type MetadataReport = {
  format: ContainerFormat;
  fields: MetadataField[];
  /** Kinds of metadata blocks found, e.g. "EXIF", "XMP". */
  blocks: string[];
  gps?: { latitude: number; longitude: number };
  orientation?: number;
};

const TAGS: Record<number, [MetadataField["group"], string]> = {
  0x010e: ["Photo", "Description"],
  0x010f: ["Camera", "Make"],
  0x0110: ["Camera", "Model"],
  0x0112: ["Photo", "Orientation"],
  0x0131: ["File", "Software"],
  0x0132: ["File", "Modified"],
  0x013b: ["Photo", "Artist"],
  0x8298: ["Photo", "Copyright"],
  0x829a: ["Photo", "Exposure time"],
  0x829d: ["Photo", "F-number"],
  0x8827: ["Photo", "ISO"],
  0x9003: ["Photo", "Date taken"],
  0x9010: ["Photo", "Time zone offset"],
  0x9209: ["Photo", "Flash"],
  0x920a: ["Photo", "Focal length"],
  0xa002: ["Photo", "Width"],
  0xa003: ["Photo", "Height"],
  0xa405: ["Photo", "Focal length (35mm)"],
  0xa430: ["Camera", "Owner name"],
  0xa431: ["Camera", "Serial number"],
  0xa433: ["Camera", "Lens make"],
  0xa434: ["Camera", "Lens model"],
};

const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

type Tiff = { view: DataView; little: boolean };
type RawValue = number | string | number[];

const strictUtf8 = new TextDecoder("utf-8", { fatal: true });

/** EXIF "ASCII" text: officially 7-bit, but UTF-8 is common in practice. */
export function decodeAscii(bytes: Uint8Array) {
  const end = bytes.indexOf(0);
  const text = end === -1 ? bytes : bytes.subarray(0, end);
  try {
    return strictUtf8.decode(text).trim();
  } catch {
    return String.fromCharCode(...text).trim();
  }
}

function readValue({ view, little }: Tiff, entry: number): RawValue | undefined {
  const type = view.getUint16(entry + 2, little);
  const count = view.getUint32(entry + 4, little);
  const size = (TYPE_SIZES[type] ?? 0) * count;
  if (!size) return undefined;
  const offset = size <= 4 ? entry + 8 : view.getUint32(entry + 8, little);
  if (offset + size > view.byteLength) return undefined;

  if (type === 2) return decodeAscii(new Uint8Array(view.buffer, view.byteOffset + offset, count));
  const values: number[] = [];
  for (let i = 0; i < Math.min(count, 16); i++) {
    const at = offset + i * TYPE_SIZES[type];
    if (type === 1 || type === 7) values.push(view.getUint8(at));
    else if (type === 3) values.push(view.getUint16(at, little));
    else if (type === 4) values.push(view.getUint32(at, little));
    else if (type === 9) values.push(view.getInt32(at, little));
    else if (type === 5) values.push(view.getUint32(at, little) / (view.getUint32(at + 4, little) || 1));
    else if (type === 10) values.push(view.getInt32(at, little) / (view.getInt32(at + 4, little) || 1));
  }
  return values.length === 1 ? values[0] : values;
}

function readIfd(tiff: Tiff, offset: number): Map<number, RawValue> {
  const tags = new Map<number, RawValue>();
  if (offset + 2 > tiff.view.byteLength) return tags;
  const count = tiff.view.getUint16(offset, tiff.little);
  for (let i = 0; i < count; i++) {
    const entry = offset + 2 + i * 12;
    if (entry + 12 > tiff.view.byteLength) break;
    const value = readValue(tiff, entry);
    if (value !== undefined) tags.set(tiff.view.getUint16(entry, tiff.little), value);
  }
  return tags;
}

function formatValue(tag: number, value: RawValue): string {
  const n = typeof value === "number" ? value : Array.isArray(value) ? value[0] : NaN;
  if (Number.isNaN(n) && typeof value !== "string") return String(value);
  switch (tag) {
    case 0x829a:
      return n >= 1 ? `${n} s` : `1/${Math.round(1 / n)} s`;
    case 0x829d:
      return `f/${n.toFixed(1)}`;
    case 0x920a:
    case 0xa405:
      return `${Math.round(n * 10) / 10} mm`;
    case 0x9209:
      return n & 1 ? "Fired" : "Did not fire";
    case 0x0112:
      return (
        ["", "Normal", "Mirrored", "Rotated 180°", "Flipped vertically", "Mirrored, rotated 90° CCW", "Rotated 90° CW", "Mirrored, rotated 90° CW", "Rotated 90° CCW"][n] ?? String(n)
      );
    default:
      return Array.isArray(value) ? value.join(", ") : String(value);
  }
}

function dmsToDegrees(value: RawValue | undefined, ref: RawValue | undefined) {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const degrees = value[0] + value[1] / 60 + value[2] / 3600;
  return ref === "S" || ref === "W" ? -degrees : degrees;
}

function parseTiff(bytes: Uint8Array, report: MetadataReport) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 8) return;
  const little = view.getUint16(0) === 0x4949;
  const tiff = { view, little };
  const ifd0 = readIfd(tiff, view.getUint32(4, little));
  const exif = ifd0.has(0x8769) ? readIfd(tiff, ifd0.get(0x8769) as number) : new Map();
  const gps = ifd0.has(0x8825) ? readIfd(tiff, ifd0.get(0x8825) as number) : new Map();

  for (const [tag, value] of [...ifd0, ...exif]) {
    const known = TAGS[tag];
    if (known && value !== "") report.fields.push({ group: known[0], label: known[1], value: formatValue(tag, value) });
  }
  const orientation = ifd0.get(0x0112);
  if (typeof orientation === "number") report.orientation = orientation;

  const latitude = dmsToDegrees(gps.get(2), gps.get(1));
  const longitude = dmsToDegrees(gps.get(4), gps.get(3));
  if (latitude !== undefined && longitude !== undefined && (latitude || longitude)) {
    report.gps = { latitude, longitude };
    report.fields.push({ group: "Location", label: "GPS coordinates", value: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
    const altitude = gps.get(6);
    if (typeof altitude === "number") {
      report.fields.push({ group: "Location", label: "Altitude", value: `${Math.round(altitude)} m${gps.get(5) === 1 ? " below sea level" : ""}` });
    }
  }
}

const PNG_METADATA = new Set(["eXIf", "tEXt", "iTXt", "zTXt", "tIME"]);

export function readMetadata(bytes: Uint8Array): MetadataReport {
  const report: MetadataReport = { format: detectContainer(bytes), fields: [], blocks: [] };
  const addBlock = (kind: string) => !report.blocks.includes(kind) && report.blocks.push(kind);

  try {
    if (report.format === "jpeg") {
      for (const segment of jpegSegments(bytes).segments) {
        if (!segment.kind) continue;
        addBlock(segment.kind);
        if (segment.kind === "EXIF") parseTiff(bytes.subarray(segment.start + 10, segment.end), report);
        if (segment.kind === "Comment") {
          report.fields.push({ group: "File", label: "Comment", value: new TextDecoder().decode(bytes.subarray(segment.start + 4, segment.end)) });
        }
      }
    } else if (report.format === "png") {
      for (const chunk of pngChunks(bytes)) {
        if (!PNG_METADATA.has(chunk.type)) continue;
        const data = bytes.subarray(chunk.start + 8, chunk.end - 4);
        if (chunk.type === "eXIf") {
          addBlock("EXIF");
          parseTiff(data, report);
        } else if (chunk.type === "tEXt" || chunk.type === "iTXt") {
          const nul = data.indexOf(0);
          const key = new TextDecoder().decode(data.subarray(0, nul));
          if (key === "XML:com.adobe.xmp") addBlock("XMP");
          else {
            addBlock("Text");
            const value = new TextDecoder().decode(data.subarray(nul + 1)).replace(/^[\0\s]+/, "").replace(/\0/g, " ");
            report.fields.push({ group: "File", label: key, value: value.slice(0, 200) });
          }
        } else {
          addBlock(chunk.type === "tIME" ? "Timestamp" : "Compressed text");
        }
      }
    } else if (report.format === "webp") {
      for (const chunk of webpChunks(bytes)) {
        if (chunk.type === "EXIF") {
          addBlock("EXIF");
          let data = bytes.subarray(chunk.start + 8, chunk.end);
          if (ascii(data, 0, 4) === "Exif") data = data.subarray(6);
          parseTiff(data, report);
        } else if (chunk.type === "XMP ") addBlock("XMP");
      }
    }
  } catch {
    // Malformed metadata: report what was found so far.
  }
  return report;
}

/** An EXIF block holding only the orientation, so rotated photos still display upright. */
function orientationExif(orientation: number) {
  const tiff = [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0];
  const payload = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff]; // "Exif\0\0" + TIFF
  const length = payload.length + 2;
  return new Uint8Array([0xff, 0xe1, length >> 8, length & 0xff, ...payload]);
}

/** Returns a copy of the file without metadata, or null if the format isn't supported. */
export function stripMetadata(bytes: Uint8Array): Uint8Array | null {
  const format = detectContainer(bytes);

  if (format === "jpeg") {
    const { orientation } = readMetadata(bytes);
    const { segments, dataStart } = jpegSegments(bytes);
    const kept = segments.filter((s) => !s.kind).map((s) => bytes.subarray(s.start, s.end));
    const extra = orientation && orientation !== 1 ? [orientationExif(orientation)] : [];
    return concat([bytes.subarray(0, 2), ...extra, ...kept, bytes.subarray(dataStart)]);
  }

  if (format === "png") {
    const chunks = pngChunks(bytes).filter((c) => !PNG_METADATA.has(c.type));
    return concat([bytes.subarray(0, 8), ...chunks.map((c) => bytes.subarray(c.start, c.end))]);
  }

  if (format === "webp") {
    const chunks = webpChunks(bytes)
      .filter((c) => c.type !== "EXIF" && c.type !== "XMP ")
      .map((c) => bytes.slice(c.start, c.end));
    // Clear the EXIF and XMP flags in the extended header, if present.
    if (ascii(chunks[0], 0, 4) === "VP8X") chunks[0][8] &= ~(0x08 | 0x04);
    return webpFile(chunks);
  }

  return null;
}
