// Pure data about image formats. Safe to import from server components;
// the browser-only encoding code lives in `@/lib/image`.

export type ImageFormatId = "png" | "jpg" | "webp" | "avif" | "gif" | "bmp" | "ico";

export type ImageFormat = {
  id: ImageFormatId;
  label: string;
  mime: string;
  extension: string;
  /** Whether a quality setting applies when encoding. */
  lossy: boolean;
  transparency: boolean;
};

export const IMAGE_FORMATS: Record<ImageFormatId, ImageFormat> = {
  png: { id: "png", label: "PNG", mime: "image/png", extension: "png", lossy: false, transparency: true },
  jpg: { id: "jpg", label: "JPG", mime: "image/jpeg", extension: "jpg", lossy: true, transparency: false },
  webp: { id: "webp", label: "WebP", mime: "image/webp", extension: "webp", lossy: true, transparency: true },
  avif: { id: "avif", label: "AVIF", mime: "image/avif", extension: "avif", lossy: true, transparency: true },
  gif: { id: "gif", label: "GIF", mime: "image/gif", extension: "gif", lossy: false, transparency: true },
  bmp: { id: "bmp", label: "BMP", mime: "image/bmp", extension: "bmp", lossy: false, transparency: false },
  ico: { id: "ico", label: "ICO", mime: "image/x-icon", extension: "ico", lossy: false, transparency: true },
};

export const OUTPUT_FORMAT_IDS: ImageFormatId[] = ["png", "jpg", "webp", "avif", "gif", "bmp", "ico"];

/** Labels for formats people convert *from*; includes SVG which we can read but not write. */
export const SOURCE_FORMAT_LABELS: Record<string, string> = {
  png: "PNG",
  jpg: "JPG",
  webp: "WebP",
  avif: "AVIF",
  gif: "GIF",
  bmp: "BMP",
  svg: "SVG",
  ico: "ICO",
};

export const FORMAT_DESCRIPTIONS: Record<string, string> = {
  png: "PNG is a lossless format with full transparency support. It's ideal for screenshots, logos and graphics with sharp edges, but photos saved as PNG are much larger than they need to be.",
  jpg: "JPG (also written JPEG) uses lossy compression that makes photos dramatically smaller, and every device, app and website can open it. It doesn't support transparency.",
  webp: "WebP is a modern format from Google that is typically 25–35% smaller than JPG or PNG at the same quality and supports transparency, but some older apps and editors can't open it.",
  avif: "AVIF is a newer format based on the AV1 video codec. It compresses even better than WebP, but support in older browsers, editors and operating systems is still limited.",
  gif: "GIF supports simple animations and transparency but is limited to 256 colors, so photos saved as GIF lose detail and show banding.",
  bmp: "BMP is an uncompressed Windows bitmap format. It's simple and widely readable, but files are very large.",
  svg: "SVG is a vector format written in XML, so it stays sharp at any size. Many apps, social networks and document editors only accept raster images like PNG, though.",
  ico: "ICO is the Windows icon format used for website favicons. One ICO file can hold several sizes of the same icon.",
};

export type ImageConversion = { from: string; to: ImageFormatId };

// Each pair gets its own landing page at /tools/convert/<from>-to-<to>.
export const IMAGE_CONVERSIONS: ImageConversion[] = [
  { from: "png", to: "jpg" },
  { from: "jpg", to: "png" },
  { from: "webp", to: "png" },
  { from: "webp", to: "jpg" },
  { from: "png", to: "webp" },
  { from: "jpg", to: "webp" },
  { from: "svg", to: "png" },
  { from: "avif", to: "jpg" },
  { from: "avif", to: "png" },
  { from: "png", to: "ico" },
  { from: "gif", to: "png" },
  { from: "bmp", to: "png" },
];

export const conversionSlug = ({ from, to }: ImageConversion) => `${from}-to-${to}`;

export function findConversion(slug: string): ImageConversion | undefined {
  return IMAGE_CONVERSIONS.find((c) => conversionSlug(c) === slug);
}
