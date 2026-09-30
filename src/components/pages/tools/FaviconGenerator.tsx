"use client";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ColorInput from "@/components/tools/ColorInput";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SliderField, SwitchField } from "@/components/tools/fields";
import { useImageFile } from "@/hooks/use-image-file";
import { downloadBlob } from "@/lib/files";
import { canvasToBlob, encodeIco, imageSize } from "@/lib/image";
import { createZip } from "@/lib/zip";

type IconOptions = { padding: number; radius: number; background: string | null };

const PNG_ICONS = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180, opaque: true },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

function renderIcon(img: HTMLImageElement, size: number, { padding, radius, background }: IconOptions) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  if (background) {
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, (radius / 100) * (size / 2));
    ctx.fillStyle = background;
    ctx.fill();
  }
  const { width, height } = imageSize(img);
  const inner = size * (1 - (2 * padding) / 100);
  const scale = Math.min(inner / width, inner / height);
  const w = width * scale;
  const h = height * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

export default function FaviconGenerator() {
  const { file, image, url, load, clear } = useImageFile();
  const [padding, setPadding] = useState(0);
  const [radius, setRadius] = useState(20);
  const [useBackground, setUseBackground] = useState(false);
  const [background, setBackground] = useState("#ffffff");
  const [appName, setAppName] = useState("My Website");
  const [themeColor, setThemeColor] = useState("#7c3aed");
  const [previews, setPreviews] = useState<string[]>([]);

  const options = useMemo<IconOptions>(
    () => ({ padding, radius, background: useBackground ? background : null }),
    [padding, radius, useBackground, background],
  );

  useEffect(() => {
    if (!image) return;
    const urls = [16, 32, 180].map((size) => renderIcon(image, size, options).toDataURL());
    setPreviews(urls);
  }, [image, options]);

  const manifest = JSON.stringify(
    {
      name: appName,
      short_name: appName,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: themeColor,
      background_color: useBackground ? background : "#ffffff",
      display: "standalone",
    },
    null,
    2,
  );

  const html = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${themeColor}">`;

  const downloadAll = async () => {
    if (!image) return;
    const pngs = await Promise.all(
      PNG_ICONS.map(async ({ name, size, opaque }) => ({
        name,
        // iOS shows transparent touch icons on black, so give them a background.
        data: await canvasToBlob(
          renderIcon(image, size, opaque && !options.background ? { ...options, background: "#ffffff", radius: 0 } : options),
          "image/png",
        ),
      })),
    );
    const ico = await encodeIco([16, 32, 48].map((size) => renderIcon(image, size, options)));
    const zip = await createZip([
      { name: "favicon.ico", data: ico },
      ...pngs,
      { name: "site.webmanifest", data: manifest },
      { name: "favicon-snippet.html", data: html },
    ]);
    downloadBlob(zip, "favicons.zip");
  };

  if (!file || !image || !url) {
    return (
      <ToolCard>
        <FileDropzone
          accept="image/*,.svg"
          onFiles={([f]) => load(f)}
          label="Drop your logo or icon"
          hint="A square PNG or SVG of at least 512×512 works best."
        />
      </ToolCard>
    );
  }

  const { width, height } = imageSize(image);

  return (
    <ToolCard>
      <FileInfoBar file={file} thumbnail={url} detail={`${width}×${height}`} onClear={clear} />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <SliderField label="Padding" value={padding} onChange={setPadding} min={0} max={30} format={(v) => `${v}%`} />
          <SwitchField label="Background color" description="Fill behind your icon instead of leaving it transparent." checked={useBackground} onChange={setUseBackground} />
          {useBackground && (
            <div className="grid grid-cols-2 gap-4 items-end">
              <ColorInput label="Color" value={background} onChange={setBackground} />
              <SliderField label="Corner radius" value={radius} onChange={setRadius} min={0} max={100} format={(v) => `${v}%`} />
            </div>
          )}
          <Field label="App name" htmlFor="fav-name">
            <Input id="fav-name" value={appName} onChange={(e) => setAppName(e.target.value)} />
          </Field>
          <ColorInput label="Theme color" value={themeColor} onChange={setThemeColor} className="max-w-56" />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Preview</p>
          <div className="flex items-end gap-6 rounded-lg border bg-muted/30 p-4">
            {previews.map((src, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <img src={src} alt="" style={{ width: [16, 32, 64][i], height: [16, 32, 64][i] }} className="[image-rendering:pixelated]" />
                <span className="text-xs text-muted-foreground">{["16px", "32px", "Home screen"][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-t-lg border border-b-0 bg-background px-3 py-2 text-sm w-fit max-w-full">
            {previews[0] && <img src={previews[0]} alt="" className="h-4 w-4" />}
            <span className="truncate">{appName}</span>
          </div>
          <Button onClick={downloadAll} className="w-full">
            <Download /> Download favicon package (.zip)
          </Button>
        </div>
      </div>

      <OutputField multiline mono label="Paste this into your <head>" value={html} />
    </ToolCard>
  );
}
