// Color quantization: reduces an image to at most 256 colors using median cut,
// with optional Floyd–Steinberg dithering. Used by the GIF and PNG encoders.

export type QuantizeOptions = {
  maxColors?: number;
  /**
   * "binary": pixels are either opaque or transparent (GIF).
   * "full": partial alpha is quantized along with color (indexed PNG with tRNS).
   * Either way, fully transparent pixels get a reserved palette slot.
   */
  alpha?: "binary" | "full";
  dither?: boolean;
};

export type Quantized = {
  /** RGBA palette, 4 bytes per entry. */
  palette: Uint8Array;
  count: number;
  indices: Uint8Array;
  /** Palette index of the fully transparent entry, or -1 if unused. */
  transparentIndex: number;
};

const SAMPLE_LIMIT = 50000;
const WEIGHTS = [2, 4, 3, 3]; // perceptual-ish weights for R, G, B, A

function medianCut(samples: Uint32Array, channels: number, maxColors: number): number[][] {
  const shift = (ch: number) => 8 * (channels - 1 - ch);
  const channel = (c: number, ch: number) => (c >>> shift(ch)) & 255;
  type Box = { start: number; end: number; score: number; channel: number };

  const measure = (start: number, end: number): Box => {
    const min = new Array(channels).fill(255);
    const max = new Array(channels).fill(0);
    for (let i = start; i < end; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const v = channel(samples[i], ch);
        if (v < min[ch]) min[ch] = v;
        if (v > max[ch]) max[ch] = v;
      }
    }
    const ranges = max.map((m, ch) => (m - min[ch]) * WEIGHTS[ch]);
    const widest = ranges.indexOf(Math.max(...ranges));
    return { start, end, score: ranges[widest] * (end - start), channel: widest };
  };

  const boxes: Box[] = [measure(0, samples.length)];
  while (boxes.length < maxColors) {
    let target = -1;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.end - box.start > 1 && box.score > 0 && (target < 0 || box.score > boxes[target].score)) {
        target = i;
      }
    }
    if (target < 0) break;
    const box = boxes[target];
    samples
      .subarray(box.start, box.end)
      .sort((a, b) => channel(a, box.channel) - channel(b, box.channel));
    const mid = (box.start + box.end) >> 1;
    boxes.splice(target, 1, measure(box.start, mid), measure(mid, box.end));
  }

  return boxes.map(({ start, end }) => {
    const sum = new Array(channels).fill(0);
    for (let i = start; i < end; i++) {
      for (let ch = 0; ch < channels; ch++) sum[ch] += channel(samples[i], ch);
    }
    return sum.map((s) => Math.round(s / (end - start)));
  });
}

export function quantize(
  image: ImageData,
  { maxColors = 256, alpha = "binary", dither = false }: QuantizeOptions = {},
): Quantized {
  const { data: rgba, width } = image;
  const full = alpha === "full";
  const channels = full ? 4 : 3;
  const pixelCount = rgba.length / 4;
  const isTransparent = (i: number) => (full ? rgba[i + 3] === 0 : rgba[i + 3] < 128);

  let hasTransparency = false;
  for (let i = 0; i < rgba.length; i += 4) {
    if (isTransparent(i)) {
      hasTransparency = true;
      break;
    }
  }

  // Sample visible pixels, packing each into one 32-bit number.
  const pack = (r: number, g: number, b: number, a: number) =>
    full ? ((r << 24) | (g << 16) | (b << 8) | a) >>> 0 : (r << 16) | (g << 8) | b;
  const step = Math.max(1, Math.floor(pixelCount / SAMPLE_LIMIT));
  const sampled: number[] = [];
  for (let p = 0; p < pixelCount; p += step) {
    const i = p * 4;
    if (!isTransparent(i)) sampled.push(pack(rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]));
  }
  const colors = sampled.length
    ? medianCut(Uint32Array.from(sampled), channels, Math.min(256, maxColors) - (hasTransparency ? 1 : 0))
    : [[0, 0, 0, 0].slice(0, channels)];

  const transparentIndex = hasTransparency ? colors.length : -1;
  const count = colors.length + (hasTransparency ? 1 : 0);
  const palette = new Uint8Array(count * 4);
  colors.forEach((c, i) => palette.set([c[0], c[1], c[2], full ? c[3] : 255], i * 4));
  // The transparent entry (if any) is the last one and stays [0, 0, 0, 0].

  // Nearest palette entry, cached on 5 bits per channel.
  const cache = new Int16Array(1 << (5 * channels)).fill(-1);
  const nearest = (r: number, g: number, b: number, a: number) => {
    let key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    if (full) key = (key << 5) | (a >> 3);
    if (cache[key] >= 0) return cache[key];
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < colors.length; i++) {
      const c = colors[i];
      let d = (r - c[0]) ** 2 * 2 + (g - c[1]) ** 2 * 4 + (b - c[2]) ** 2 * 3;
      if (full) d += (a - c[3]) ** 2 * 3;
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    }
    cache[key] = best;
    return best;
  };

  const indices = new Uint8Array(pixelCount);
  const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
  // Floyd–Steinberg error for the current and next row, offset by one pixel
  // so x - 1 and x + 1 never fall outside the buffer.
  let errors = dither ? new Float32Array((width + 2) * 3) : null;
  let nextErrors = dither ? new Float32Array((width + 2) * 3) : null;

  for (let p = 0; p < pixelCount; p++) {
    const i = p * 4;
    const x = p % width;
    if (errors && nextErrors && x === 0 && p > 0) {
      [errors, nextErrors] = [nextErrors, errors];
      nextErrors.fill(0);
    }
    if (isTransparent(i)) {
      indices[p] = transparentIndex;
      continue;
    }
    const a = rgba[i + 3];
    if (!errors || !nextErrors) {
      indices[p] = nearest(rgba[i], rgba[i + 1], rgba[i + 2], a);
      continue;
    }
    const e = (x + 1) * 3;
    const r = clamp(rgba[i] + errors[e]);
    const g = clamp(rgba[i + 1] + errors[e + 1]);
    const b = clamp(rgba[i + 2] + errors[e + 2]);
    const index = nearest(r, g, b, a);
    indices[p] = index;
    const c = colors[index];
    const diff = [r - c[0], g - c[1], b - c[2]];
    for (let ch = 0; ch < 3; ch++) {
      errors[e + 3 + ch] += (diff[ch] * 7) / 16; // right
      nextErrors[e - 3 + ch] += (diff[ch] * 3) / 16; // below left
      nextErrors[e + ch] += (diff[ch] * 5) / 16; // below
      nextErrors[e + 3 + ch] += diff[ch] / 16; // below right
    }
  }

  return { palette, count, indices, transparentIndex };
}
