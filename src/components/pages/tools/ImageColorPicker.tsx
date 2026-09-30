"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/tools/CopyButton";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker } from "@/components/tools/fields";
import { useImageFile } from "@/hooks/use-image-file";
import { type RGB, formatHsl, formatRgb, readableTextColor, rgbToHex, rgbToHsl } from "@/lib/color";
import { copyText } from "@/lib/clipboard";
import { imageSize, renderToCanvas } from "@/lib/image";
import { quantize } from "@/lib/quantize";

type EyeDropperWindow = Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } };

function extractPalette(image: HTMLImageElement, count: number): { rgb: RGB; share: number }[] {
  const { width, height } = imageSize(image);
  const scale = Math.min(1, 200 / Math.max(width, height));
  const canvas = renderToCanvas(image, { width: width * scale, height: height * scale });
  const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
  const { palette, count: size, indices, transparentIndex } = quantize(data, { maxColors: count + 1 });
  const counts = new Array(size).fill(0);
  indices.forEach((i) => i !== transparentIndex && counts[i]++);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return counts
    .map((n, i) => ({ rgb: { r: palette[i * 4], g: palette[i * 4 + 1], b: palette[i * 4 + 2] }, share: n / total }))
    .filter((c, i) => i !== transparentIndex && c.share > 0)
    .sort((a, b) => b.share - a.share)
    .slice(0, count);
}

function Swatch({ rgb, caption }: { rgb: RGB; caption?: string }) {
  const hex = rgbToHex(rgb).toUpperCase();
  return (
    <button
      type="button"
      onClick={() => copyText(hex, `Copied ${hex}`)}
      className="flex h-24 flex-col items-center justify-end rounded-lg border p-2 text-xs font-mono transition-transform hover:scale-105"
      style={{ backgroundColor: hex, color: readableTextColor(rgb) }}
      title="Click to copy"
    >
      <span className="font-semibold">{hex}</span>
      {caption && <span className="opacity-80">{caption}</span>}
    </button>
  );
}

export default function ImageColorPicker() {
  const { file, image, url, load, clear } = useImageFile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<RGB | null>(null);
  const [picked, setPicked] = useState<RGB>({ r: 124, g: 58, b: 237 });
  const [paletteSize, setPaletteSize] = useState<"5" | "8" | "12">("8");
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  useEffect(() => setHasEyeDropper(!!(window as EyeDropperWindow).EyeDropper), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const { width, height } = imageSize(image);
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d", { willReadFrequently: true })!.drawImage(image, 0, 0, width, height);
  }, [image]);

  const palette = useMemo(
    () => (image ? extractPalette(image, Number(paletteSize)) : []),
    [image, paletteSize],
  );

  const colorAt = (e: React.MouseEvent<HTMLCanvasElement>): RGB => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const [r, g, b] = canvas.getContext("2d")!.getImageData(x, y, 1, 1).data;
    return { r, g, b };
  };

  const pickFromScreen = async () => {
    const EyeDropper = (window as EyeDropperWindow).EyeDropper!;
    try {
      const { sRGBHex } = await new EyeDropper().open();
      const n = parseInt(sRGBHex.slice(1), 16);
      setPicked({ r: n >> 16, g: (n >> 8) & 255, b: n & 255 });
    } catch {
      // Cancelled with Escape.
    }
  };

  const shown = hover ?? picked;
  const hex = rgbToHex(picked).toUpperCase();

  return (
    <ToolCard>
      {!file || !image || !url ? (
        <FileDropzone accept="image/*,.svg" onFiles={([f]) => load(f)} label="Drop an image to pick colors from" hint="Screenshots, photos, logos… anything works." />
      ) : (
        <>
          <FileInfoBar file={file} thumbnail={url} onClear={clear} />
          <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
            <canvas
              ref={canvasRef}
              className="max-h-[60vh] w-auto max-w-full cursor-crosshair justify-self-center rounded-lg border"
              onPointerMove={(e) => setHover(colorAt(e))}
              onPointerLeave={() => setHover(null)}
              onClick={(e) => setPicked(colorAt(e))}
            />
            <div className="space-y-4">
              <div
                className="flex h-28 items-center justify-center rounded-lg border font-mono text-lg font-semibold"
                style={{ backgroundColor: rgbToHex(shown), color: readableTextColor(shown) }}
              >
                {rgbToHex(shown).toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">Hover to preview, click to pick.</p>
              {[hex, formatRgb(picked), formatHsl(rgbToHsl(picked))].map((value) => (
                <div key={value} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 font-mono text-sm">
                  {value}
                  <CopyButton value={value} variant="ghost" size="icon" className="h-7 w-7" />
                </div>
              ))}
              {hasEyeDropper && (
                <Button variant="outline" className="w-full" onClick={pickFromScreen}>
                  <Pipette /> Pick from anywhere on screen
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {palette.length > 0 && (
        <div className="space-y-3">
          <Field
            label="Dominant colors"
            extra={
              <OptionPicker
                value={paletteSize}
                onChange={setPaletteSize}
                options={[
                  { value: "5", label: "5" },
                  { value: "8", label: "8" },
                  { value: "12", label: "12" },
                ]}
              />
            }
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {palette.map(({ rgb, share }) => (
                <Swatch key={rgbToHex(rgb)} rgb={rgb} caption={`${Math.round(share * 100)}%`} />
              ))}
            </div>
          </Field>
          <CopyButton
            label="Copy palette as CSS variables"
            value={`:root {\n${palette.map(({ rgb }, i) => `  --color-${i + 1}: ${rgbToHex(rgb)};`).join("\n")}\n}`}
          />
        </div>
      )}
    </ToolCard>
  );
}
