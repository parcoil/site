export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3,4}$/i.test(h)) h = [...h.slice(0, 3)].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export const rgbToHex = ({ r, g, b }: RGB) =>
  "#" + [r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0")).join("");

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

export const formatRgb = ({ r, g, b }: RGB) => `rgb(${r}, ${g}, ${b})`;
export const formatHsl = ({ h, s, l }: HSL) => `hsl(${h}, ${s}%, ${l}%)`;

export function formatCmyk({ r, g, b }: RGB) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return "cmyk(0%, 0%, 0%, 100%)";
  const part = (c: number) => Math.round(((1 - c / 255 - k) / (1 - k)) * 100);
  return `cmyk(${part(r)}%, ${part(g)}%, ${part(b)}%, ${Math.round(k * 100)}%)`;
}

let parserContext: CanvasRenderingContext2D | null = null;

/** Parses hex, rgb(), hsl() and (in the browser) any CSS color name. */
export function parseColor(input: string): RGB | null {
  const value = input.trim().toLowerCase();
  if (!value) return null;
  const hex = hexToRgb(value);
  if (hex) return hex;

  const numbers = value.match(/-?[\d.]+/g)?.map(Number) ?? [];
  if (/^rgba?\(/.test(value) && numbers.length >= 3) {
    const [r, g, b] = numbers.map((n, i) => (value.includes("%") && i < 3 ? n * 2.55 : n));
    return { r: clamp(Math.round(r), 0, 255), g: clamp(Math.round(g), 0, 255), b: clamp(Math.round(b), 0, 255) };
  }
  if (/^hsla?\(/.test(value) && numbers.length >= 3) {
    return hslToRgb({ h: numbers[0], s: numbers[1], l: numbers[2] });
  }

  if (typeof document === "undefined") return null;
  parserContext ??= document.createElement("canvas").getContext("2d");
  if (!parserContext) return null;
  // Use two different sentinels so an invalid name can't be mistaken for a real color.
  parserContext.fillStyle = "#000001";
  parserContext.fillStyle = value;
  const first = parserContext.fillStyle;
  parserContext.fillStyle = "#000002";
  parserContext.fillStyle = value;
  return first === parserContext.fillStyle ? hexToRgb(first) : null;
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance({ r, g, b }: RGB) {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB) {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Black or white, whichever reads better on the given background. */
export const readableTextColor = (background: RGB) =>
  contrastRatio(background, { r: 0, g: 0, b: 0 }) >= contrastRatio(background, { r: 255, g: 255, b: 255 })
    ? "#000000"
    : "#ffffff";

export function mixRgb(a: RGB, b: RGB, amount: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * amount),
    g: Math.round(a.g + (b.g - a.g) * amount),
    b: Math.round(a.b + (b.b - a.b) * amount),
  };
}
