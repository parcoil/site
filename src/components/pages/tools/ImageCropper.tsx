"use client";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { useImageFile } from "@/hooks/use-image-file";
import { baseName, downloadBlob } from "@/lib/files";
import { detectFormat, encodeImage, imageSize, renderToCanvas } from "@/lib/image";
import { IMAGE_FORMATS, type ImageFormatId } from "@/lib/image-formats";

type Rect = { x: number; y: number; width: number; height: number };
type Handle = "move" | "nw" | "ne" | "sw" | "se";

const RATIOS = {
  free: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "4:5": 4 / 5,
  "2:3": 2 / 3,
} as const;
type RatioId = keyof typeof RATIOS;

const MIN_SIZE = 8;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Largest centered rect with the ratio, covering 80% of the image. */
function initialRect(bounds: { width: number; height: number }, ratio: number | null): Rect {
  let width = bounds.width * 0.8;
  let height = bounds.height * 0.8;
  if (ratio) {
    if (width / height > ratio) width = height * ratio;
    else height = width / ratio;
  }
  return { x: (bounds.width - width) / 2, y: (bounds.height - height) / 2, width, height };
}

function dragRect(
  start: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  bounds: { width: number; height: number },
  ratio: number | null,
): Rect {
  if (handle === "move") {
    return {
      ...start,
      x: clamp(start.x + dx, 0, bounds.width - start.width),
      y: clamp(start.y + dy, 0, bounds.height - start.height),
    };
  }
  const west = handle.includes("w");
  const north = handle.includes("n");
  // The opposite corner stays put.
  const anchorX = west ? start.x + start.width : start.x;
  const anchorY = north ? start.y + start.height : start.y;
  const cornerX = clamp((west ? start.x : start.x + start.width) + dx, 0, bounds.width);
  const cornerY = clamp((north ? start.y : start.y + start.height) + dy, 0, bounds.height);
  let width = Math.max(MIN_SIZE, west ? anchorX - cornerX : cornerX - anchorX);
  let height = Math.max(MIN_SIZE, north ? anchorY - cornerY : cornerY - anchorY);
  if (ratio) {
    const maxWidth = west ? anchorX : bounds.width - anchorX;
    const maxHeight = north ? anchorY : bounds.height - anchorY;
    if (width / height > ratio) width = height * ratio;
    else height = width / ratio;
    if (width > maxWidth) [width, height] = [maxWidth, maxWidth / ratio];
    if (height > maxHeight) [width, height] = [maxHeight * ratio, maxHeight];
  }
  return { x: west ? anchorX - width : anchorX, y: north ? anchorY - height : anchorY, width, height };
}

export default function ImageCropper() {
  const { file, image, url, load, clear } = useImageFile();
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const [ratioId, setRatioId] = useState<RatioId>("free");
  const [circle, setCircle] = useState(false);
  const [target, setTarget] = useState<"original" | ImageFormatId>("original");
  const [displayWidth, setDisplayWidth] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ handle: Handle; x: number; y: number; start: Rect } | null>(null);

  const bounds = image ? imageSize(image) : { width: 1, height: 1 };
  const ratio = RATIOS[ratioId];
  const scale = displayWidth / bounds.width || 1;

  useEffect(() => {
    if (image) setRect(initialRect(imageSize(image), RATIOS[ratioId]));
  }, [image, ratioId]);

  // Track the rendered size so screen pixels can be mapped to image pixels.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setDisplayWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [url]);

  const startDrag = (handle: Handle) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { handle, x: e.clientX, y: e.clientY, start: rect };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setRect(dragRect(d.start, d.handle, (e.clientX - d.x) / scale, (e.clientY - d.y) / scale, bounds, ratio));
  };

  const setField = (key: keyof Rect) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!Number.isFinite(value)) return;
    setRect((r) => {
      const next = { ...r, [key]: value };
      if (ratio && key === "width") next.height = value / ratio;
      if (ratio && key === "height") next.width = value * ratio;
      next.width = clamp(next.width, 1, bounds.width);
      next.height = clamp(next.height, 1, bounds.height);
      next.x = clamp(next.x, 0, bounds.width - next.width);
      next.y = clamp(next.y, 0, bounds.height - next.height);
      return next;
    });
  };

  const rounded = {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
  };

  const source = file ? detectFormat(file) : "png";
  const format: ImageFormatId = circle
    ? "png"
    : target === "original"
      ? ((["png", "jpg", "webp"].includes(source) ? source : "png") as ImageFormatId)
      : target;

  const download = async () => {
    if (!image || !file) return;
    const canvas = renderToCanvas(image, {
      crop: rounded,
      background: IMAGE_FORMATS[format].transparency ? null : "#ffffff",
    });
    if (circle) {
      const ctx = canvas.getContext("2d")!;
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const blob = await encodeImage(canvas, format, 0.92);
    downloadBlob(blob, `${baseName(file.name)}-cropped.${IMAGE_FORMATS[format].extension}`);
  };

  if (!file || !image || !url) {
    return (
      <ToolCard>
        <FileDropzone accept="image/*,.svg" onFiles={([f]) => load(f)} label="Drop an image to crop" hint="PNG, JPG, WebP, AVIF, GIF, BMP or SVG" />
      </ToolCard>
    );
  }

  const handleClass =
    "absolute h-4 w-4 rounded-full border-2 border-white bg-primary shadow touch-none";

  return (
    <ToolCard>
      <FileInfoBar file={file} detail={`${bounds.width}×${bounds.height}`} onClear={clear} />

      <Field label="Aspect ratio">
        <OptionPicker
          value={ratioId}
          onChange={setRatioId}
          options={(Object.keys(RATIOS) as RatioId[]).map((id) => ({ value: id, label: id === "free" ? "Free" : id }))}
        />
      </Field>

      <div className="flex justify-center rounded-lg bg-[repeating-conic-gradient(#8882_0_25%,transparent_0_50%)] bg-size-[16px_16px] p-2">
        <div
          className="relative inline-block select-none overflow-hidden touch-none"
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
        >
          <img
            ref={imgRef}
            src={url}
            alt="Image being cropped"
            draggable={false}
            className="block max-h-[60vh] max-w-full"
          />
          <div
            className={`absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ${circle ? "rounded-full" : ""}`}
            style={{
              left: rect.x * scale,
              top: rect.y * scale,
              width: rect.width * scale,
              height: rect.height * scale,
            }}
            onPointerDown={startDrag("move")}
          >
            {(["nw", "ne", "sw", "se"] as const).map((h) => (
              <span
                key={h}
                onPointerDown={startDrag(h)}
                className={`${handleClass} ${h.includes("n") ? "-top-2" : "-bottom-2"} ${h.includes("w") ? "-left-2" : "-right-2"} ${h === "nw" || h === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["x", "y", "width", "height"] as const).map((key) => (
          <Field key={key} label={key === "x" ? "X" : key === "y" ? "Y" : key === "width" ? "Width" : "Height"} htmlFor={`crop-${key}`}>
            <Input id={`crop-${key}`} type="number" value={rounded[key]} onChange={setField(key)} />
          </Field>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
        <Field label="Save as">
          <OptionPicker
            value={circle ? "png" : target}
            onChange={setTarget}
            options={[
              { value: "original", label: "Original", disabled: circle },
              { value: "png", label: "PNG" },
              { value: "jpg", label: "JPG", disabled: circle },
              { value: "webp", label: "WebP", disabled: circle },
            ]}
          />
        </Field>
        <SwitchField
          label="Circle crop"
          description="Cut out a circle with a transparent background (PNG)."
          checked={circle}
          onChange={setCircle}
        />
      </div>

      <Button onClick={download} className="w-full sm:w-auto">
        <Download /> Download {rounded.width}×{rounded.height} {IMAGE_FORMATS[format].label}
      </Button>
    </ToolCard>
  );
}
