// Low-level walkers for the JPEG, PNG and WebP file structures, shared by the
// metadata reader, remover and editor.
import { crc32 } from "@/lib/crc32";

export type ContainerFormat = "jpeg" | "png" | "webp" | "other";

export const ascii = (bytes: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...bytes.subarray(start, start + length));

export function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function detectContainer(bytes: Uint8Array): ContainerFormat {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG") return "png";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "webp";
  return "other";
}

export type JpegSegment = { start: number; end: number; marker: number; kind?: string };

/** Segments before the image data. `kind` is set for metadata segments. */
export function jpegSegments(bytes: Uint8Array): { segments: JpegSegment[]; dataStart: number } {
  const segments: JpegSegment[] = [];
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda) break; // start of scan: image data follows
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + length;
    const payload = offset + 4;
    let kind: string | undefined;
    if (marker === 0xe1 && ascii(bytes, payload, 4) === "Exif") kind = "EXIF";
    else if (marker === 0xe1 && ascii(bytes, payload, 20).startsWith("http://ns.adobe.com")) kind = "XMP";
    else if (marker === 0xe1) kind = "APP1";
    else if (marker === 0xed) kind = "IPTC / Photoshop";
    else if (marker === 0xfe) kind = "Comment";
    else if (marker === 0xe2 && ascii(bytes, payload, 11) === "ICC_PROFILE") kind = undefined; // color profile, keep
    else if (marker >= 0xe3 && marker <= 0xef && marker !== 0xee) kind = `APP${marker - 0xe0}`;
    segments.push({ start: offset, end, marker, kind });
    offset = end;
  }
  return { segments, dataStart: offset };
}

export type Chunk = { start: number; end: number; type: string };

export function pngChunks(bytes: Uint8Array): Chunk[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: Chunk[] = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    chunks.push({ start: offset, end: offset + 12 + length, type });
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return chunks;
}

/** Builds a PNG chunk: length, type, data and CRC. */
export function pngChunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export function webpChunks(bytes: Uint8Array): Chunk[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: Chunk[] = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const size = view.getUint32(offset + 4, true);
    const end = offset + 8 + size + (size % 2); // chunks are padded to even sizes
    chunks.push({ start: offset, end, type: ascii(bytes, offset, 4) });
    offset = end;
  }
  return chunks;
}

/** Builds a WebP (RIFF) chunk, padded to an even length. */
export function webpChunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(8 + data.length + (data.length % 2));
  for (let i = 0; i < 4; i++) out[i] = type.charCodeAt(i);
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
}

/** Builds a RIFF WebP file from its chunks. */
export function webpFile(chunks: Uint8Array[]) {
  const body = concat(chunks);
  const header = new Uint8Array(12);
  header.set([0x52, 0x49, 0x46, 0x46]); // "RIFF"
  new DataView(header.buffer).setUint32(4, body.length + 4, true);
  header.set([0x57, 0x45, 0x42, 0x50], 8); // "WEBP"
  return concat([header, body]);
}

/** The raw TIFF-structured EXIF data inside a JPEG, PNG or WebP, if any. */
export function findExif(bytes: Uint8Array): Uint8Array | null {
  switch (detectContainer(bytes)) {
    case "jpeg": {
      const segment = jpegSegments(bytes).segments.find((s) => s.kind === "EXIF");
      return segment ? bytes.subarray(segment.start + 10, segment.end) : null;
    }
    case "png": {
      const chunk = pngChunks(bytes).find((c) => c.type === "eXIf");
      return chunk ? bytes.subarray(chunk.start + 8, chunk.end - 4) : null;
    }
    case "webp": {
      const chunk = webpChunks(bytes).find((c) => c.type === "EXIF");
      if (!chunk) return null;
      const data = bytes.subarray(chunk.start + 8, chunk.end);
      return ascii(data, 0, 4) === "Exif" ? data.subarray(6) : data;
    }
    default:
      return null;
  }
}
