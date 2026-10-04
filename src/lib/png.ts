// Lossy PNG compression in the style of TinyPNG: reduce the image to a
// palette of at most 256 RGBA colors, then write an indexed PNG. The zlib
// stream comes from the browser's built-in CompressionStream.
import { crc32 } from "@/lib/crc32";
import { quantize } from "@/lib/quantize";

const SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

async function zlibCompress(data: Uint8Array) {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function chunk(type: string, data: Uint8Array) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export async function encodeIndexedPng(
  image: ImageData,
  { colors = 256, dither = true }: { colors?: number; dither?: boolean } = {},
) {
  const { width, height } = image;
  const { palette, count, indices } = quantize(image, { maxColors: colors, alpha: "full", dither });

  // Pack indices at the smallest bit depth that fits the palette.
  const bitDepth = count <= 2 ? 1 : count <= 4 ? 2 : count <= 16 ? 4 : 8;
  const perByte = 8 / bitDepth;
  const rowBytes = Math.ceil(width / perByte);
  const raw = new Uint8Array((rowBytes + 1) * height); // each row starts with filter type 0
  for (let y = 0; y < height; y++) {
    const row = y * (rowBytes + 1) + 1;
    for (let x = 0; x < width; x++) {
      const index = indices[y * width + x];
      if (bitDepth === 8) raw[row + x] = index;
      else raw[row + Math.floor(x / perByte)] |= index << (8 - bitDepth * ((x % perByte) + 1));
    }
  }

  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header[8] = bitDepth;
  header[9] = 3; // indexed color

  const rgb = new Uint8Array(count * 3);
  const alpha = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    rgb.set(palette.subarray(i * 4, i * 4 + 3), i * 3);
    alpha[i] = palette[i * 4 + 3];
  }
  // tRNS can omit trailing fully-opaque entries.
  let alphaLength = count;
  while (alphaLength > 0 && alpha[alphaLength - 1] === 255) alphaLength--;

  const parts: Uint8Array[] = [SIGNATURE, chunk("IHDR", header), chunk("PLTE", rgb)];
  if (alphaLength > 0) parts.push(chunk("tRNS", alpha.subarray(0, alphaLength)));
  parts.push(chunk("IDAT", await zlibCompress(raw)), chunk("IEND", new Uint8Array(0)));
  return new Blob(parts as BlobPart[], { type: "image/png" });
}
