// Animated GIF encoder: a quantized local palette per frame and LZW compression.
import { quantize } from "@/lib/quantize";

class ByteWriter {
  private chunks: Uint8Array[] = [];
  private buffer = new Uint8Array(65536);
  private length = 0;

  byte(value: number) {
    if (this.length === this.buffer.length) {
      this.chunks.push(this.buffer);
      this.buffer = new Uint8Array(65536);
      this.length = 0;
    }
    this.buffer[this.length++] = value;
  }

  word(value: number) {
    this.byte(value & 0xff);
    this.byte((value >> 8) & 0xff);
  }

  bytes(values: ArrayLike<number>) {
    for (let i = 0; i < values.length; i++) this.byte(values[i]);
  }

  string(text: string) {
    for (let i = 0; i < text.length; i++) this.byte(text.charCodeAt(i));
  }

  toBlob(type: string) {
    return new Blob([...this.chunks, this.buffer.subarray(0, this.length)] as BlobPart[], { type });
  }
}

/** GIF LZW compression, written as length-prefixed sub-blocks. Mirrors omggif's encoder. */
function writeLzw(out: ByteWriter, indices: Uint8Array, minCodeSize: number) {
  out.byte(minCodeSize);
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let nextCode = eoiCode + 1;
  let codeSize = minCodeSize + 1;
  let table = new Map<number, number>();

  const block: number[] = [];
  let bits = 0;
  let bitCount = 0;
  const flushBytes = (min: number) => {
    while (bitCount >= min) {
      block.push(bits & 0xff);
      bits >>>= 8;
      bitCount -= 8;
      if (block.length === 255) {
        out.byte(255);
        out.bytes(block);
        block.length = 0;
      }
    }
  };
  const emit = (code: number) => {
    bits |= code << bitCount;
    bitCount += codeSize;
    flushBytes(8);
  };

  emit(clearCode);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = (prefix << 8) | k;
    const code = table.get(key);
    if (code !== undefined) {
      prefix = code;
      continue;
    }
    emit(prefix);
    if (nextCode === 4096) {
      emit(clearCode);
      nextCode = eoiCode + 1;
      codeSize = minCodeSize + 1;
      table = new Map();
    } else {
      if (nextCode >= 1 << codeSize) codeSize++;
      table.set(key, nextCode++);
    }
    prefix = k;
  }
  emit(prefix);
  emit(eoiCode);
  flushBytes(1);
  if (block.length) {
    out.byte(block.length);
    out.bytes(block);
  }
  out.byte(0);
}

export class GifEncoder {
  private out = new ByteWriter();
  private width: number;
  private height: number;

  constructor(width: number, height: number, { loop = true }: { loop?: boolean } = {}) {
    this.width = width;
    this.height = height;
    const out = this.out;
    out.string("GIF89a");
    out.word(width);
    out.word(height);
    out.bytes([0, 0, 0]); // no global color table
    if (loop) {
      out.bytes([0x21, 0xff, 0x0b]);
      out.string("NETSCAPE2.0");
      out.bytes([0x03, 0x01, 0x00, 0x00, 0x00]); // loop forever
    }
  }

  /** Adds a frame. `delay` is in milliseconds. */
  addFrame(image: ImageData, delay = 100, dither = false) {
    const { palette, count, indices, transparentIndex } = quantize(image, { dither });
    // GIF color tables hold a power-of-two number of RGB entries.
    const paletteBits = Math.max(1, Math.ceil(Math.log2(count)));
    const colorTable = new Uint8Array(3 * (1 << paletteBits));
    for (let i = 0; i < count; i++) colorTable.set(palette.subarray(i * 4, i * 4 + 3), i * 3);
    const out = this.out;
    const transparent = transparentIndex >= 0;
    // Graphic control extension: disposal 2 (restore to background) when transparent.
    out.bytes([0x21, 0xf9, 0x04, (transparent ? 2 << 2 : 1 << 2) | (transparent ? 1 : 0)]);
    out.word(Math.round(delay / 10));
    out.bytes([transparent ? transparentIndex : 0, 0]);
    // Image descriptor with a local color table.
    out.byte(0x2c);
    out.word(0);
    out.word(0);
    out.word(this.width);
    out.word(this.height);
    out.byte(0x80 | (paletteBits - 1));
    out.bytes(colorTable);
    writeLzw(out, indices, Math.max(2, paletteBits));
  }

  finish() {
    this.out.byte(0x3b);
    return this.out.toBlob("image/gif");
  }
}
