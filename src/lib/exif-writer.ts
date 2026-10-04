// Edits photo metadata losslessly: the existing EXIF is parsed into editable
// tag maps, changes are applied, and a fresh EXIF block is written back into
// the JPEG, PNG or WebP without touching the image data.
import { utf8Encode } from "@/lib/encoding";
import { decodeAscii } from "@/lib/exif";
import {
  ascii,
  concat,
  detectContainer,
  findExif,
  jpegSegments,
  pngChunk,
  pngChunks,
  webpChunk,
  webpChunks,
  webpFile,
} from "@/lib/image-containers";

/** One TIFF entry, with its value bytes already in the block's byte order. */
type Entry = { type: number; count: number; data: Uint8Array };
type Ifd = Map<number, Entry>;
export type ExifBlock = { little: boolean; ifd0: Ifd; exif: Ifd; gps: Ifd };

const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
const EXIF_POINTER = 0x8769;
const GPS_POINTER = 0x8825;
const ORIENTATION = 0x0112;
// Pointers we rebuild ourselves, and blocks whose contents hold offsets that
// would break when moved (maker notes, thumbnails, interoperability data).
const SKIPPED_TAGS = [EXIF_POINTER, GPS_POINTER, 0xa005, 0x927c, 0x0201, 0x0202, 0x0111, 0x0117, 0x014a];

// ---------------------------------------------------------------- parsing

function readIfd(view: DataView, little: boolean, offset: number): Ifd {
  const ifd: Ifd = new Map();
  if (offset < 8 || offset + 2 > view.byteLength) return ifd;
  const count = view.getUint16(offset, little);
  for (let i = 0; i < count; i++) {
    const entry = offset + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const type = view.getUint16(entry + 2, little);
    const n = view.getUint32(entry + 4, little);
    const size = (TYPE_SIZES[type] ?? 0) * n;
    const at = size <= 4 ? entry + 8 : view.getUint32(entry + 8, little);
    if (!size || at + size > view.byteLength) continue;
    const data = new Uint8Array(view.buffer, view.byteOffset + at, size).slice();
    ifd.set(view.getUint16(entry, little), { type, count: n, data });
  }
  return ifd;
}

export function parseExif(tiff: Uint8Array | null): ExifBlock {
  const empty: ExifBlock = { little: true, ifd0: new Map(), exif: new Map(), gps: new Map() };
  if (!tiff || tiff.length < 8) return empty;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const order = view.getUint16(0);
  if (order !== 0x4949 && order !== 0x4d4d) return empty;
  const little = order === 0x4949;
  const ifd0 = readIfd(view, little, view.getUint32(4, little));
  const subIfd = (tag: number) => {
    const pointer = ifd0.get(tag);
    return pointer?.type === 4 ? readIfd(view, little, new DataView(pointer.data.buffer).getUint32(0, little)) : new Map();
  };
  const block = { little, ifd0, exif: subIfd(EXIF_POINTER), gps: subIfd(GPS_POINTER) };
  for (const ifd of [block.ifd0, block.exif, block.gps]) SKIPPED_TAGS.forEach((tag) => ifd.delete(tag));
  return block;
}

// --------------------------------------------------------------- encoding

function encoders(little: boolean) {
  const numbers = (type: number, width: number, values: number[], write: (v: DataView, at: number, n: number) => void): Entry => {
    const data = new Uint8Array(values.length * width);
    const view = new DataView(data.buffer);
    values.forEach((n, i) => write(view, i * width, n));
    return { type, count: values.length, data };
  };
  return {
    ascii: (text: string): Entry => {
      // Metadata Working Group guidance is for readers to try UTF-8, then fall back
      // to Latin-1. Latin-1 also displays correctly in Windows, so use it whenever
      // the text fits (©, é, ñ…) and UTF-8 only when it doesn't.
      const latin1 = [...text].every((c) => c.codePointAt(0)! <= 0xff);
      const bytes = latin1 ? Uint8Array.from(text, (c) => c.charCodeAt(0)) : utf8Encode(text);
      const data = new Uint8Array(bytes.length + 1); // NUL-terminated
      data.set(bytes);
      return { type: 2, count: data.length, data };
    },
    /** Windows "XP" tags: UTF-16LE text stored as bytes, whatever the block's byte order. */
    xp: (text: string): Entry => {
      const data = new Uint8Array((text.length + 1) * 2);
      for (let i = 0; i < text.length; i++) new DataView(data.buffer).setUint16(i * 2, text.charCodeAt(i), true);
      return { type: 1, count: data.length, data };
    },
    bytes: (...values: number[]): Entry => ({ type: 1, count: values.length, data: Uint8Array.from(values) }),
    short: (...values: number[]) => numbers(3, 2, values, (v, at, n) => v.setUint16(at, n, little)),
    long: (...values: number[]) => numbers(4, 4, values, (v, at, n) => v.setUint32(at, n, little)),
    /** Unsigned rationals, each given as a decimal and stored with the given precision. */
    rational: (values: number[], denominator = 1): Entry => {
      const data = new Uint8Array(values.length * 8);
      const view = new DataView(data.buffer);
      values.forEach((n, i) => {
        view.setUint32(i * 8, Math.round(n * denominator), little);
        view.setUint32(i * 8 + 4, denominator, little);
      });
      return { type: 5, count: values.length, data };
    },
  };
}

function decodeNumbers(entry: Entry | undefined, little: boolean): number[] {
  if (!entry) return [];
  const view = new DataView(entry.data.buffer, entry.data.byteOffset, entry.data.byteLength);
  return Array.from({ length: entry.count }, (_, i) => {
    switch (entry.type) {
      case 3:
        return view.getUint16(i * 2, little);
      case 4:
        return view.getUint32(i * 4, little);
      case 5:
        return view.getUint32(i * 8, little) / (view.getUint32(i * 8 + 4, little) || 1);
      default:
        return entry.data[i];
    }
  });
}

const decodeXp = (entry?: Entry) =>
  entry ? new TextDecoder("utf-16le").decode(entry.data).replace(/\0+$/, "").trim() : "";

export function serializeExif({ little, ifd0, exif, gps }: ExifBlock): Uint8Array {
  const enc = encoders(little);
  const root = new Map(ifd0);
  const size = (ifd: Ifd) =>
    2 + ifd.size * 12 + 4 + [...ifd.values()].reduce((n, e) => n + (e.data.length > 4 ? e.data.length + (e.data.length % 2) : 0), 0);

  // Reserve pointer entries first so the root IFD's size is final.
  if (exif.size) root.set(EXIF_POINTER, enc.long(0));
  if (gps.size) root.set(GPS_POINTER, enc.long(0));
  const exifOffset = 8 + size(root);
  const gpsOffset = exifOffset + (exif.size ? size(exif) : 0);
  if (exif.size) root.set(EXIF_POINTER, enc.long(exifOffset));
  if (gps.size) root.set(GPS_POINTER, enc.long(gpsOffset));

  const out = new Uint8Array(gpsOffset + (gps.size ? size(gps) : 0));
  const view = new DataView(out.buffer);
  out.set(little ? [0x49, 0x49] : [0x4d, 0x4d]);
  view.setUint16(2, 42, little);
  view.setUint32(4, 8, little);

  const writeIfd = (ifd: Ifd, offset: number) => {
    const tags = [...ifd.keys()].sort((a, b) => a - b); // entries must be in tag order
    view.setUint16(offset, tags.length, little);
    let overflow = offset + 2 + tags.length * 12 + 4;
    tags.forEach((tag, i) => {
      const entry = ifd.get(tag)!;
      const at = offset + 2 + i * 12;
      view.setUint16(at, tag, little);
      view.setUint16(at + 2, entry.type, little);
      view.setUint32(at + 4, entry.count, little);
      if (entry.data.length <= 4) {
        out.set(entry.data, at + 8);
      } else {
        view.setUint32(at + 8, overflow, little);
        out.set(entry.data, overflow);
        overflow += entry.data.length + (entry.data.length % 2);
      }
    });
    view.setUint32(offset + 2 + tags.length * 12, 0, little); // no next IFD
  };

  writeIfd(root, 8);
  if (exif.size) writeIfd(exif, exifOffset);
  if (gps.size) writeIfd(gps, gpsOffset);
  return out;
}

// ------------------------------------------------------ editable fields

export type MetadataValues = {
  title: string;
  subject: string;
  description: string;
  keywords: string;
  comments: string;
  rating: string;
  artist: string;
  copyright: string;
  owner: string;
  make: string;
  model: string;
  lens: string;
  software: string;
  dateTaken: string; // "YYYY-MM-DDTHH:MM:SS", as used by <input type="datetime-local">
  latitude: string;
  longitude: string;
  altitude: string;
};

export const EMPTY_VALUES: MetadataValues = {
  title: "",
  subject: "",
  description: "",
  keywords: "",
  comments: "",
  rating: "",
  artist: "",
  copyright: "",
  owner: "",
  make: "",
  model: "",
  lens: "",
  software: "",
  dateTaken: "",
  latitude: "",
  longitude: "",
  altitude: "",
};

type TextField = "title" | "subject" | "description" | "keywords" | "comments" | "artist" | "copyright" | "owner" | "make" | "model" | "lens" | "software";
type TagRef = { ifd: "ifd0" | "exif"; tag: number; kind: "ascii" | "xp" };

// Windows Explorer reads the XP* tags; most other software reads the standard ones.
const TEXT_TAGS: Record<TextField, TagRef[]> = {
  title: [{ ifd: "ifd0", tag: 0x9c9b, kind: "xp" }],
  subject: [{ ifd: "ifd0", tag: 0x9c9f, kind: "xp" }],
  description: [{ ifd: "ifd0", tag: 0x010e, kind: "ascii" }],
  keywords: [{ ifd: "ifd0", tag: 0x9c9e, kind: "xp" }],
  comments: [{ ifd: "ifd0", tag: 0x9c9c, kind: "xp" }],
  artist: [
    { ifd: "ifd0", tag: 0x013b, kind: "ascii" },
    { ifd: "ifd0", tag: 0x9c9d, kind: "xp" },
  ],
  copyright: [{ ifd: "ifd0", tag: 0x8298, kind: "ascii" }],
  owner: [{ ifd: "exif", tag: 0xa430, kind: "ascii" }],
  make: [{ ifd: "ifd0", tag: 0x010f, kind: "ascii" }],
  model: [{ ifd: "ifd0", tag: 0x0110, kind: "ascii" }],
  lens: [{ ifd: "exif", tag: 0xa434, kind: "ascii" }],
  software: [{ ifd: "ifd0", tag: 0x0131, kind: "ascii" }],
};

const DATE_TAGS = { original: 0x9003, digitized: 0x9004, modified: 0x0132 };
const RATING = 0x4746;
const RATING_PERCENT = 0x4749;
const RATING_PERCENTS = [0, 1, 25, 50, 75, 99]; // Windows' mapping of stars to percent

/** "2024:05:01 10:20:30" ↔ "2024-05-01T10:20:30" */
const exifDateToInput = (text: string) =>
  /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}(:\d{2})?/.test(text) ? text.slice(0, 19).replace(/^(\d{4}):(\d{2}):(\d{2}) /, "$1-$2-$3T") : "";
const inputToExifDate = (value: string) => {
  const [date, time = "00:00:00"] = value.split("T");
  return `${date.replace(/-/g, ":")} ${time.length === 5 ? `${time}:00` : time.slice(0, 8)}`;
};

const formatCoordinate = (n: number) => String(Math.round(n * 1e6) / 1e6);

export function readValues(block: ExifBlock): MetadataValues {
  const values = { ...EMPTY_VALUES };
  for (const [field, refs] of Object.entries(TEXT_TAGS) as [TextField, TagRef[]][]) {
    for (const ref of refs) {
      const entry = block[ref.ifd].get(ref.tag);
      const text = ref.kind === "xp" ? decodeXp(entry) : entry?.type === 2 ? decodeAscii(entry.data) : "";
      if (text) {
        values[field] = text;
        break;
      }
    }
  }

  const date = block.exif.get(DATE_TAGS.original) ?? block.ifd0.get(DATE_TAGS.modified);
  if (date?.type === 2) values.dateTaken = exifDateToInput(decodeAscii(date.data));

  const [stars] = decodeNumbers(block.ifd0.get(RATING), block.little);
  if (stars) values.rating = String(Math.min(5, stars));

  const dms = (tag: number) => decodeNumbers(block.gps.get(tag), block.little);
  const ref = (tag: number) => (block.gps.get(tag) ? decodeAscii(block.gps.get(tag)!.data) : "");
  const [latD, latM, latS] = dms(2);
  const [lonD, lonM, lonS] = dms(4);
  if (latD !== undefined && lonD !== undefined) {
    const lat = (latD + (latM ?? 0) / 60 + (latS ?? 0) / 3600) * (ref(1) === "S" ? -1 : 1);
    const lon = (lonD + (lonM ?? 0) / 60 + (lonS ?? 0) / 3600) * (ref(3) === "W" ? -1 : 1);
    values.latitude = formatCoordinate(lat);
    values.longitude = formatCoordinate(lon);
    const [altitude] = dms(6);
    if (altitude !== undefined) {
      const [below] = decodeNumbers(block.gps.get(5), block.little);
      values.altitude = String(Math.round(altitude * (below === 1 ? -1 : 1) * 100) / 100);
    }
  }
  return values;
}

/** Fills blank edits from the photo's existing values (for editing many photos at once). */
export function mergeValues(existing: MetadataValues, edits: MetadataValues): MetadataValues {
  const merged = { ...existing };
  for (const key of Object.keys(edits) as (keyof MetadataValues)[]) {
    if (edits[key].trim() && key !== "latitude" && key !== "longitude" && key !== "altitude") merged[key] = edits[key];
  }
  // Location is replaced as a whole or not at all.
  if (edits.latitude.trim() && edits.longitude.trim()) {
    merged.latitude = edits.latitude;
    merged.longitude = edits.longitude;
    merged.altitude = edits.altitude;
  }
  return merged;
}

/** Parses a coordinate pair like "37.7749, -122.4194" or a single number. */
export const parseCoordinate = (text: string) => {
  const n = Number(text.trim());
  return text.trim() !== "" && Number.isFinite(n) ? n : null;
};

/**
 * Sets every editable field to exactly `values`; blank fields are removed.
 * With `keepOther`, everything else (exposure, ISO, lens data…) is preserved.
 */
export function applyValues(source: ExifBlock, values: MetadataValues, { keepOther }: { keepOther: boolean }): ExifBlock {
  const enc = encoders(source.little);
  const block: ExifBlock = keepOther
    ? { little: source.little, ifd0: new Map(source.ifd0), exif: new Map(source.exif), gps: new Map() }
    : { little: source.little, ifd0: new Map(), exif: new Map(), gps: new Map() };
  // Orientation is always kept so the photo doesn't display sideways.
  const orientation = source.ifd0.get(ORIENTATION);
  if (orientation) block.ifd0.set(ORIENTATION, orientation);

  const assign = (value: string, apply: () => void, clear: () => void) => (value.trim() ? apply() : clear());

  for (const [field, refs] of Object.entries(TEXT_TAGS) as [TextField, TagRef[]][]) {
    let value = values[field].trim();
    if (field === "keywords") value = value.split(/[;,]/).map((k) => k.trim()).filter(Boolean).join("; ");
    assign(
      value,
      () => refs.forEach((ref) => block[ref.ifd].set(ref.tag, ref.kind === "xp" ? enc.xp(value) : enc.ascii(value))),
      () => refs.forEach((ref) => block[ref.ifd].delete(ref.tag)),
    );
  }

  assign(
    values.dateTaken,
    () => {
      const date = enc.ascii(inputToExifDate(values.dateTaken));
      block.exif.set(DATE_TAGS.original, date);
      block.exif.set(DATE_TAGS.digitized, date);
      block.ifd0.set(DATE_TAGS.modified, date);
    },
    () => {
      block.exif.delete(DATE_TAGS.original);
      block.exif.delete(DATE_TAGS.digitized);
    },
  );

  const stars = Math.round(Number(values.rating) || 0);
  assign(
    stars > 0 ? String(stars) : "",
    () => {
      block.ifd0.set(RATING, enc.short(stars));
      block.ifd0.set(RATING_PERCENT, enc.short(RATING_PERCENTS[Math.min(5, stars)]));
    },
    () => {
      block.ifd0.delete(RATING);
      block.ifd0.delete(RATING_PERCENT);
    },
  );

  const lat = parseCoordinate(values.latitude);
  const lon = parseCoordinate(values.longitude);
  if (lat !== null && lon !== null) {
    const toDms = (n: number) => {
      const abs = Math.abs(n);
      const degrees = Math.floor(abs);
      const minutes = Math.floor((abs - degrees) * 60);
      return [degrees, minutes, (abs - degrees - minutes / 60) * 3600];
    };
    const gps: Ifd = new Map();
    gps.set(0x0000, enc.bytes(2, 3, 0, 0)); // GPS version
    gps.set(0x0001, enc.ascii(lat < 0 ? "S" : "N"));
    gps.set(0x0002, enc.rational(toDms(lat), 10000));
    gps.set(0x0003, enc.ascii(lon < 0 ? "W" : "E"));
    gps.set(0x0004, enc.rational(toDms(lon), 10000));
    const altitude = parseCoordinate(values.altitude);
    if (altitude !== null) {
      gps.set(0x0005, enc.bytes(altitude < 0 ? 1 : 0));
      gps.set(0x0006, enc.rational([Math.abs(altitude)], 100));
    }
    block.gps = gps;
  }

  // Exif IFDs are expected to declare their version.
  if (block.exif.size && !block.exif.has(0x9000)) {
    block.exif.set(0x9000, { type: 7, count: 4, data: utf8Encode("0232") });
  }
  return block;
}

const isEmpty = (block: ExifBlock) => !block.ifd0.size && !block.exif.size && !block.gps.size;

// ------------------------------------------------------------ embedding

// Standard PNG text keywords, filled from the same values.
const PNG_TEXT: [string, (v: MetadataValues) => string][] = [
  ["Title", (v) => v.title],
  ["Author", (v) => v.artist],
  ["Description", (v) => v.description],
  ["Copyright", (v) => v.copyright],
  ["Comment", (v) => v.comments],
  ["Software", (v) => v.software],
  ["Creation Time", (v) => (v.dateTaken ? new Date(v.dateTaken).toUTCString() : "")],
];

function pngTextChunk(keyword: string, text: string) {
  // iTXt: keyword, NUL, uncompressed, no language or translated keyword, UTF-8 text.
  return pngChunk("iTXt", concat([utf8Encode(keyword), new Uint8Array([0, 0, 0, 0, 0]), utf8Encode(text)]));
}

/** Canvas size from a simple WebP's VP8 or VP8L bitstream, plus whether it has alpha. */
function webpInfo(bytes: Uint8Array, chunk: { start: number; type: string }) {
  const data = bytes.subarray(chunk.start + 8);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (chunk.type === "VP8L") {
    const bits = view.getUint32(1, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, alpha: ((bits >> 28) & 1) === 1 };
  }
  return { width: view.getUint16(6, true) & 0x3fff, height: view.getUint16(8, true) & 0x3fff, alpha: false };
}

/**
 * Writes an edited EXIF block (and PNG text) into the file. With `removeXmp`,
 * any XMP packet is dropped so apps that prefer XMP don't show stale values.
 * Returns null for unsupported formats.
 */
export function writeMetadata(bytes: Uint8Array, block: ExifBlock, { removeXmp = false } = {}): Uint8Array | null {
  const tiff = isEmpty(block) ? null : serializeExif(block);

  switch (detectContainer(bytes)) {
    case "jpeg": {
      const { segments, dataStart } = jpegSegments(bytes);
      const kept = segments
        .filter((s) => s.kind !== "EXIF" && !(removeXmp && s.kind === "XMP"))
        .map((s) => ({ marker: s.marker, data: bytes.subarray(s.start, s.end) }));
      let app1: Uint8Array[] = [];
      if (tiff) {
        const length = 2 + 6 + tiff.length;
        if (length > 0xffff) throw new Error("There's too much metadata to fit in a JPEG. Try shortening the text fields.");
        app1 = [new Uint8Array([0xff, 0xe1, length >> 8, length & 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0]), tiff];
      }
      // EXIF goes right after the JFIF header if there is one, otherwise first.
      const at = kept[0]?.marker === 0xe0 ? 1 : 0;
      return concat([
        bytes.subarray(0, 2),
        ...kept.slice(0, at).map((s) => s.data),
        ...app1,
        ...kept.slice(at).map((s) => s.data),
        bytes.subarray(dataStart),
      ]);
    }

    case "png": {
      const values = readValues(block);
      const managed = new Set(PNG_TEXT.map(([keyword]) => keyword));
      const added = [
        ...(tiff ? [pngChunk("eXIf", tiff)] : []),
        ...PNG_TEXT.filter(([, get]) => get(values)).map(([keyword, get]) => pngTextChunk(keyword, get(values))),
      ];
      const parts: Uint8Array[] = [bytes.subarray(0, 8)];
      let inserted = false;
      for (const chunk of pngChunks(bytes)) {
        const data = bytes.subarray(chunk.start, chunk.end);
        if (chunk.type === "eXIf") continue;
        if (chunk.type === "tEXt" || chunk.type === "iTXt") {
          const keyword = ascii(bytes, chunk.start + 8, Math.min(79, chunk.end - chunk.start - 12)).split("\0")[0];
          if (managed.has(keyword) || (removeXmp && keyword === "XML:com.adobe.xmp")) continue;
        }
        // eXIf must come before the image data.
        if (chunk.type === "IDAT" && !inserted) {
          parts.push(...added);
          inserted = true;
        }
        parts.push(data);
      }
      return concat(parts);
    }

    case "webp": {
      const found = webpChunks(bytes).filter((c) => c.type !== "EXIF" && !(removeXmp && c.type === "XMP "));
      const chunks = found.map((c) => bytes.slice(c.start, c.end));
      let header = chunks.find((c) => ascii(c, 0, 4) === "VP8X");
      if (!header && tiff) {
        // Simple WebPs can't hold EXIF, so add the extended header first.
        const image = found.find((c) => c.type === "VP8 " || c.type === "VP8L");
        if (!image) throw new Error("This WebP file couldn't be read.");
        const { width, height, alpha } = webpInfo(bytes, image);
        header = new Uint8Array(18);
        header.set([0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0]); // "VP8X", size 10
        header[8] = alpha ? 0x10 : 0;
        [width - 1, height - 1].forEach((n, i) => header!.set([n & 255, (n >> 8) & 255, (n >> 16) & 255], 12 + i * 3));
        chunks.unshift(header);
      }
      if (header) {
        header[8] = tiff ? header[8] | 0x08 : header[8] & ~0x08;
        if (removeXmp) header[8] &= ~0x04;
      }
      if (tiff) {
        // EXIF comes after the image data and before any XMP.
        const xmp = chunks.findIndex((c) => ascii(c, 0, 4) === "XMP ");
        chunks.splice(xmp === -1 ? chunks.length : xmp, 0, webpChunk("EXIF", tiff));
      }
      return webpFile(chunks);
    }

    default:
      return null;
  }
}

/** Reads the editable EXIF block from any supported file. */
export const readExifBlock = (bytes: Uint8Array) => parseExif(findExif(bytes));

/** Uncompressed tEXt and iTXt entries from a PNG, keyed by keyword. */
function readPngText(bytes: Uint8Array) {
  const text = new Map<string, string>();
  for (const chunk of pngChunks(bytes)) {
    if (chunk.type !== "tEXt" && chunk.type !== "iTXt") continue;
    const data = bytes.subarray(chunk.start + 8, chunk.end - 4);
    const nul = data.indexOf(0);
    const keyword = ascii(data, 0, nul);
    if (chunk.type === "tEXt") {
      text.set(keyword, String.fromCharCode(...data.subarray(nul + 1)));
    } else if (data[nul + 1] === 0) {
      // iTXt: skip the compression bytes, language tag and translated keyword.
      let at = data.indexOf(0, nul + 3);
      at = data.indexOf(0, at + 1);
      text.set(keyword, new TextDecoder().decode(data.subarray(at + 1)));
    }
  }
  return text;
}

/** The editable values of a file: its EXIF, with PNG text filling any gaps. */
export function readFileValues(bytes: Uint8Array): MetadataValues {
  const values = readValues(readExifBlock(bytes));
  if (detectContainer(bytes) === "png") {
    const text = readPngText(bytes);
    const fill = (field: keyof MetadataValues, keyword: string) => {
      if (!values[field] && text.get(keyword)) values[field] = text.get(keyword)!.trim();
    };
    fill("title", "Title");
    fill("artist", "Author");
    fill("description", "Description");
    fill("copyright", "Copyright");
    fill("comments", "Comment");
    fill("software", "Software");
  }
  return values;
}
