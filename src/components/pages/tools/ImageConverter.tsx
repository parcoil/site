"use client";
import { useEffect, useState } from "react";
import BatchImageTool from "@/components/tools/BatchImageTool";
import ColorInput from "@/components/tools/ColorInput";
import { Field, OptionPicker, SliderField } from "@/components/tools/fields";
import { replaceExtension } from "@/lib/files";
import { canEncodeNatively, encodeImage, imageSize, renderToCanvas } from "@/lib/image";
import { IMAGE_FORMATS, OUTPUT_FORMAT_IDS, type ImageFormatId } from "@/lib/image-formats";

const SCALES = ["1", "2", "4"] as const;

export default function ImageConverter({
  defaultFormat = "jpg",
  sourceLabel,
}: {
  defaultFormat?: ImageFormatId;
  /** e.g. "PNG" on the PNG to JPG page. */
  sourceLabel?: string;
}) {
  const [format, setFormat] = useState<ImageFormatId>(defaultFormat);
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#ffffff");
  const [scale, setScale] = useState<(typeof SCALES)[number]>("1");
  const [avifSupported, setAvifSupported] = useState(true);
  const target = IMAGE_FORMATS[format];

  useEffect(() => {
    canEncodeNatively("image/avif").then(setAvifSupported);
  }, []);

  return (
    <BatchImageTool
      zipName={`converted-${target.extension}.zip`}
      dropLabel={sourceLabel ? `Drop ${sourceLabel} files here or click to browse` : undefined}
      settingsKey={JSON.stringify({ format, quality, background, scale })}
      process={async (file, image) => {
        const { width, height } = imageSize(image);
        const canvas = renderToCanvas(image, {
          width: width * Number(scale),
          height: height * Number(scale),
          background: target.transparency ? null : background,
        });
        const blob = await encodeImage(canvas, format, quality / 100);
        return {
          blob,
          name: replaceExtension(file.name, target.extension),
          width: canvas.width,
          height: canvas.height,
        };
      }}
      settings={
        <div className="space-y-5">
          <Field label="Convert to">
            <OptionPicker
              value={format}
              onChange={setFormat}
              options={OUTPUT_FORMAT_IDS.map((id) => ({
                value: id,
                label: IMAGE_FORMATS[id].label,
                disabled: id === "avif" && !avifSupported,
              }))}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {target.lossy && (
              <SliderField
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={10}
                max={100}
                format={(v) => `${v}%`}
              />
            )}
            {!target.transparency && (
              <ColorInput
                label="Background for transparent areas"
                hint={`${target.label} doesn't support transparency.`}
                value={background}
                onChange={setBackground}
              />
            )}
            {format !== "ico" && (
              <Field label="Scale" hint="Upscale small images and SVGs for a sharper result.">
                <OptionPicker
                  value={scale}
                  onChange={setScale}
                  options={SCALES.map((s) => ({ value: s, label: `${Number(s) * 100}%` }))}
                />
              </Field>
            )}
            {format === "ico" && (
              <p className="text-sm text-muted-foreground sm:col-span-2">
                ICO files include every standard icon size up to 256×256 that fits your image.
              </p>
            )}
          </div>
        </div>
      }
    />
  );
}
