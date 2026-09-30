// Browser-only image decoding, transforming and encoding. Everything runs on
// the user's device; nothing is uploaded.
import { GifEncoder } from "@/lib/gif";
import { IMAGE_FORMATS, type ImageFormatId } from "@/lib/image-formats";

/** Decodes any image the browser understands (PNG, JPG, WebP, AVIF, GIF, BMP, SVG, ICO…). */
export function loadImage(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      if (typeof source !== "string") URL.revokeObjectURL(url);
      reject(new Error("This image couldn't be read. It may be corrupt or in a format your browser doesn't support."));
    };
    img.src = url;
  });
}

/** Natural size, with a fallback for SVGs that don't declare one. */
export function imageSize(img: HTMLImageElement) {
  return {
    width: img.naturalWidth || img.width || 512,
    height: img.naturalHeight || img.height || 512,
  };
}

export type Rotation = 0 | 90 | 180 | 270;

export type RenderOptions = {
  /** Output size before rotation. Defaults to the source (or crop) size. */
  width?: number;
  height?: number;
  crop?: { x: number; y: number; width: number; height: number };
  rotate?: Rotation;
  flipX?: boolean;
  flipY?: boolean;
  /** Fill color behind transparent pixels, e.g. for JPG output. */
  background?: string | null;
};

export function renderToCanvas(img: HTMLImageElement, options: RenderOptions = {}) {
  const natural = imageSize(img);
  const crop = options.crop ?? { x: 0, y: 0, ...natural };
  const width = Math.max(1, Math.round(options.width ?? crop.width));
  const height = Math.max(1, Math.round(options.height ?? crop.height));
  const rotate = options.rotate ?? 0;
  const sideways = rotate === 90 || rotate === 270;

  const canvas = document.createElement("canvas");
  canvas.width = sideways ? height : width;
  canvas.height = sideways ? width : height;
  const ctx = canvas.getContext("2d")!;
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, -width / 2, -height / 2, width, height);
  return canvas;
}

/** Draws the image centered inside a square, keeping its aspect ratio. */
export function renderSquare(img: HTMLImageElement, size: number, background: string | null = null) {
  const { width, height } = imageSize(img);
  const scale = Math.min(size / width, size / height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.imageSmoothingQuality = "high";
  const w = width * scale;
  const h = height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The image couldn't be encoded."))),
      mime,
      quality,
    ),
  );
}

const nativeSupport = new Map<string, Promise<boolean>>();

/** Browsers silently fall back to PNG for formats they can't encode. */
export function canEncodeNatively(mime: string) {
  if (!nativeSupport.has(mime)) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    nativeSupport.set(
      mime,
      canvasToBlob(canvas, mime).then((b) => b.type === mime, () => false),
    );
  }
  return nativeSupport.get(mime)!;
}

function encodeBmp(canvas: HTMLCanvasElement) {
  const { width, height } = canvas;
  const { data } = canvas.getContext("2d")!.getImageData(0, 0, width, height);
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const size = 54 + rowSize * height;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0x4d42, true); // "BM"
  view.setUint32(2, size, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up rows
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, rowSize * height, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true);
  for (let y = 0; y < height; y++) {
    const row = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      bytes[row + x * 3] = data[i + 2];
      bytes[row + x * 3 + 1] = data[i + 1];
      bytes[row + x * 3 + 2] = data[i];
    }
  }
  return new Blob([bytes], { type: "image/bmp" });
}

/** Builds a .ico holding one PNG per square canvas (supported since Windows Vista). */
export async function encodeIco(canvases: HTMLCanvasElement[]) {
  const images = await Promise.all(
    canvases.map(async (canvas) => {
      const blob = await canvasToBlob(canvas, "image/png");
      return { size: canvas.width, data: new Uint8Array(await blob.arrayBuffer()) };
    }),
  );
  const header = new DataView(new ArrayBuffer(6 + 16 * images.length));
  header.setUint16(2, 1, true); // type: icon
  header.setUint16(4, images.length, true);
  let offset = header.byteLength;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.setUint8(entry, size >= 256 ? 0 : size); // 0 means 256
    header.setUint8(entry + 1, size >= 256 ? 0 : size);
    header.setUint16(entry + 4, 1, true); // color planes
    header.setUint16(entry + 6, 32, true); // bits per pixel
    header.setUint32(entry + 8, data.length, true);
    header.setUint32(entry + 12, offset, true);
    offset += data.length;
  });
  return new Blob([header.buffer, ...images.map((i) => i.data as BlobPart)], { type: "image/x-icon" });
}

export const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

export async function encodeImage(
  canvas: HTMLCanvasElement,
  format: ImageFormatId,
  quality = 0.92,
): Promise<Blob> {
  const { mime, label } = IMAGE_FORMATS[format];
  switch (format) {
    case "bmp":
      return encodeBmp(canvas);
    case "gif": {
      const encoder = new GifEncoder(canvas.width, canvas.height, { loop: false });
      encoder.addFrame(canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height), 0, true);
      return encoder.finish();
    }
    case "ico": {
      const source = await loadImage(await canvasToBlob(canvas, "image/png"));
      const largest = Math.min(256, Math.max(canvas.width, canvas.height));
      const sizes = ICO_SIZES.filter((s) => s <= largest);
      return encodeIco((sizes.length ? sizes : [16]).map((size) => renderSquare(source, size)));
    }
    default: {
      if (!(await canEncodeNatively(mime))) {
        throw new Error(`Your browser can't create ${label} files. Try Chrome, Edge or Firefox, or pick another format.`);
      }
      return canvasToBlob(canvas, mime, IMAGE_FORMATS[format].lossy ? quality : undefined);
    }
  }
}

/** Guesses a format id from a file's MIME type or extension. */
export function detectFormat(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
  };
  return byMime[file.type] ?? (ext === "jpeg" ? "jpg" : ext);
}
