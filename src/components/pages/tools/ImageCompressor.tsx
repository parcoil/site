"use client";
import { useEffect, useState } from "react";
import BatchImageTool from "@/components/tools/BatchImageTool";
import { Field, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { replaceExtension } from "@/lib/files";
import {
  canEncodeNatively,
  detectFormat,
  encodeImage,
  imageSize,
  renderToCanvas,
} from "@/lib/image";
import { IMAGE_FORMATS, type ImageFormatId } from "@/lib/image-formats";
import { encodeIndexedPng } from "@/lib/png";

type Target = "original" | "jpg" | "webp" | "avif";
const COMPRESSIBLE: string[] = ["jpg", "png", "webp", "avif"];
const MAX_SIZES = ["0", "3840", "2560", "1920", "1280", "800"] as const;

export default function ImageCompressor() {
  const [target, setTarget] = useState<Target>("original");
  const [quality, setQuality] = useState(75);
  const [pngColors, setPngColors] = useState(256);
  const [dither, setDither] = useState(true);
  const [maxSize, setMaxSize] = useState<(typeof MAX_SIZES)[number]>("0");
  const [avifSupported, setAvifSupported] = useState(true);

  useEffect(() => {
    canEncodeNatively("image/avif").then(setAvifSupported);
  }, []);

  return (
    <BatchImageTool
      accept="image/jpeg,image/png,image/webp,image/avif"
      dropHint="JPG, PNG, WebP or AVIF. Images are compressed on your device and never uploaded."
      zipName="compressed-images.zip"
      settingsKey={JSON.stringify({ target, quality, pngColors, dither, maxSize })}
      process={async (file, image) => {
        const source = detectFormat(file);
        const format = (target === "original" ? (COMPRESSIBLE.includes(source) ? source : "webp") : target) as ImageFormatId;
        const { width, height } = imageSize(image);
        const limit = Number(maxSize);
        const scale = limit && Math.max(width, height) > limit ? limit / Math.max(width, height) : 1;
        const canvas = renderToCanvas(image, {
          width: width * scale,
          height: height * scale,
          background: IMAGE_FORMATS[format].transparency ? null : "#ffffff",
        });

        let blob =
          format === "png"
            ? await encodeIndexedPng(
                canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height),
                { colors: pngColors, dither },
              )
            : await encodeImage(canvas, format, quality / 100);

        // Never hand back a bigger file than the user started with.
        const sameShape = format === source && scale === 1;
        if (sameShape && blob.size >= file.size) blob = file;

        return {
          blob,
          name: format === source ? file.name : replaceExtension(file.name, IMAGE_FORMATS[format].extension),
          width: canvas.width,
          height: canvas.height,
        };
      }}
      settings={
        <div className="space-y-5">
          <Field label="Output format">
            <OptionPicker
              value={target}
              onChange={setTarget}
              options={[
                { value: "original", label: "Keep original" },
                { value: "jpg", label: "JPG" },
                { value: "webp", label: "WebP" },
                { value: "avif", label: "AVIF", disabled: !avifSupported },
              ]}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <SliderField
              label="Quality (JPG, WebP, AVIF)"
              value={quality}
              onChange={setQuality}
              min={10}
              max={100}
              format={(v) => `${v}%`}
            />
            {target === "original" && (
              <SliderField
                label="PNG colors"
                value={pngColors}
                onChange={setPngColors}
                min={2}
                max={256}
                format={(v) => `${v} colors`}
              />
            )}
            <Field label="Max width or height" hint="Shrinking huge photos saves the most space.">
              <OptionPicker
                value={maxSize}
                onChange={setMaxSize}
                options={MAX_SIZES.map((s) => ({ value: s, label: s === "0" ? "Original" : `${s}px` }))}
              />
            </Field>
            {target === "original" && (
              <SwitchField
                label="Dither PNGs"
                description="Smooths gradients when reducing colors."
                checked={dither}
                onChange={setDither}
              />
            )}
          </div>
        </div>
      }
    />
  );
}
