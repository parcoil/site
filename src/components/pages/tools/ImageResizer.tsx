"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import BatchImageTool from "@/components/tools/BatchImageTool";
import { Field, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { replaceExtension } from "@/lib/files";
import { type Rotation, detectFormat, encodeImage, imageSize, renderToCanvas } from "@/lib/image";
import { IMAGE_FORMATS, type ImageFormatId } from "@/lib/image-formats";

type Mode = "percent" | "pixels";
type Target = "original" | "png" | "jpg" | "webp";
const KEEPABLE: string[] = ["png", "jpg", "webp", "avif", "gif", "bmp"];

export default function ImageResizer() {
  const [mode, setMode] = useState<Mode>("percent");
  const [percent, setPercent] = useState(50);
  const [width, setWidth] = useState("1280");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [rotate, setRotate] = useState<`${Rotation}`>("0");
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [target, setTarget] = useState<Target>("original");
  const [quality, setQuality] = useState(90);

  const settings = { mode, percent, width, height, keepAspect, rotate, flipX, flipY, target, quality };

  return (
    <BatchImageTool
      zipName="resized-images.zip"
      settingsKey={JSON.stringify(settings)}
      process={async (file, image) => {
        const natural = imageSize(image);
        let w = natural.width;
        let h = natural.height;
        if (mode === "percent") {
          w = (natural.width * percent) / 100;
          h = (natural.height * percent) / 100;
        } else {
          const maxW = parseInt(width) || 0;
          const maxH = parseInt(height) || 0;
          if (keepAspect) {
            const scale =
              maxW && maxH
                ? Math.min(maxW / natural.width, maxH / natural.height)
                : maxW
                  ? maxW / natural.width
                  : maxH
                    ? maxH / natural.height
                    : 1;
            w = natural.width * scale;
            h = natural.height * scale;
          } else {
            w = maxW || natural.width;
            h = maxH || natural.height;
          }
        }

        const source = detectFormat(file);
        const format = (target === "original" ? (KEEPABLE.includes(source) ? source : "png") : target) as ImageFormatId;
        const canvas = renderToCanvas(image, {
          width: w,
          height: h,
          rotate: Number(rotate) as Rotation,
          flipX,
          flipY,
          background: IMAGE_FORMATS[format].transparency ? null : "#ffffff",
        });
        return {
          blob: await encodeImage(canvas, format, quality / 100),
          name: replaceExtension(file.name, IMAGE_FORMATS[format].extension),
          width: canvas.width,
          height: canvas.height,
        };
      }}
      settings={
        <div className="space-y-5">
          <Field label="Resize by">
            <OptionPicker
              value={mode}
              onChange={setMode}
              options={[
                { value: "percent", label: "Percentage" },
                { value: "pixels", label: "Pixels" },
              ]}
            />
          </Field>

          {mode === "percent" ? (
            <SliderField
              label="Scale"
              value={percent}
              onChange={setPercent}
              min={5}
              max={400}
              format={(v) => `${v}%`}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
              <Field label="Width (px)" htmlFor="resize-width">
                <Input
                  id="resize-width"
                  type="number"
                  min={1}
                  placeholder="Auto"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </Field>
              <Field label="Height (px)" htmlFor="resize-height">
                <Input
                  id="resize-height"
                  type="number"
                  min={1}
                  placeholder="Auto"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </Field>
              <SwitchField
                className="h-9"
                label="Keep aspect ratio"
                checked={keepAspect}
                onChange={setKeepAspect}
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Rotate">
              <OptionPicker
                value={rotate}
                onChange={setRotate}
                options={(["0", "90", "180", "270"] as const).map((r) => ({ value: r, label: `${r}°` }))}
              />
            </Field>
            <div className="space-y-3">
              <SwitchField label="Flip horizontally" checked={flipX} onChange={setFlipX} />
              <SwitchField label="Flip vertically" checked={flipY} onChange={setFlipY} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Save as">
              <OptionPicker
                value={target}
                onChange={setTarget}
                options={[
                  { value: "original", label: "Original format" },
                  { value: "png", label: "PNG" },
                  { value: "jpg", label: "JPG" },
                  { value: "webp", label: "WebP" },
                ]}
              />
            </Field>
            {target !== "png" && (
              <SliderField
                label="Quality (JPG, WebP)"
                value={quality}
                onChange={setQuality}
                min={10}
                max={100}
                format={(v) => `${v}%`}
              />
            )}
          </div>
        </div>
      }
    />
  );
}
