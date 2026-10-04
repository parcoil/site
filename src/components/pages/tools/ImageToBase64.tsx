"use client";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker } from "@/components/tools/fields";
import { base64ToBytes } from "@/lib/encoding";
import { downloadBlob, formatBytes, readAsDataURL } from "@/lib/files";

/** Identifies an image type from its first bytes. */
function sniffImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  const text = new TextDecoder().decode(bytes.subarray(0, 256)).trimStart();
  if (starts(0x89, 0x50, 0x4e, 0x47)) return { mime: "image/png", ext: "png" };
  if (starts(0xff, 0xd8, 0xff)) return { mime: "image/jpeg", ext: "jpg" };
  if (starts(0x47, 0x49, 0x46)) return { mime: "image/gif", ext: "gif" };
  if (starts(0x52, 0x49, 0x46, 0x46) && text.slice(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (text.slice(4, 12) === "ftypavif") return { mime: "image/avif", ext: "avif" };
  if (starts(0x42, 0x4d)) return { mime: "image/bmp", ext: "bmp" };
  if (starts(0x00, 0x00, 0x01, 0x00)) return { mime: "image/x-icon", ext: "ico" };
  if (text.startsWith("<svg") || (text.startsWith("<?xml") && text.includes("<svg"))) return { mime: "image/svg+xml", ext: "svg" };
  return null;
}

function Encode() {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (file) readAsDataURL(file).then(setDataUrl);
    else setDataUrl("");
  }, [file]);

  if (!file) {
    return (
      <FileDropzone
        accept="image/*,.svg,.ico"
        onFiles={([f]) => setFile(f)}
        label="Drop an image to encode"
        hint="Small images like icons and logos are the best fit for data URIs."
      />
    );
  }

  const raw = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return (
    <div className="space-y-5">
      <FileInfoBar
        file={file}
        thumbnail={dataUrl || undefined}
        detail={dataUrl && `Base64 is ${formatBytes(raw.length)}`}
        onClear={() => setFile(null)}
      />
      {file.size > 100_000 && (
        <p className="text-sm text-orange-600 dark:text-orange-400">
          Base64 makes files about 33% larger and can&apos;t be cached separately, so it&apos;s best
          for images under ~10 KB.
        </p>
      )}
      <OutputField multiline mono label="Data URI" value={dataUrl} />
      <div className="grid gap-4 md:grid-cols-2">
        <OutputField mono label="HTML <img>" value={`<img src="${dataUrl}" alt="" />`} />
        <OutputField mono label="CSS background" value={`background-image: url("${dataUrl}");`} />
        <OutputField mono label="Base64 only" value={raw} />
        <OutputField mono label="Markdown" value={`![image](${dataUrl})`} />
      </div>
    </div>
  );
}

function Decode() {
  const [input, setInput] = useState("");

  const decoded = useMemo(() => {
    const text = input.trim();
    if (!text) return null;
    try {
      const match = /^data:([^;,]+)?(;base64)?,/i.exec(text);
      const bytes = base64ToBytes(match ? text.slice(match[0].length) : text);
      const type = sniffImageType(bytes) ?? (match?.[1] ? { mime: match[1], ext: match[1].split("/")[1] ?? "bin" } : null);
      if (!type) return { error: "That decodes fine, but it doesn't look like an image." };
      const blob = new Blob([bytes as BlobPart], { type: type.mime });
      return { blob, ext: type.ext, url: URL.createObjectURL(blob) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [input]);

  useEffect(() => () => {
    if (decoded && "url" in decoded) URL.revokeObjectURL(decoded.url);
  }, [decoded]);

  return (
    <div className="space-y-5">
      <Field label="Base64 or data URI" htmlFor="b64-input">
        <Textarea
          id="b64-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="data:image/png;base64,iVBORw0KGgo…"
          className="min-h-40 font-mono text-xs"
        />
      </Field>
      {decoded && "error" in decoded && <p className="text-sm text-destructive">{decoded.error}</p>}
      {decoded && "url" in decoded && (
        <div className="space-y-3">
          <div className="flex justify-center rounded-lg border bg-[repeating-conic-gradient(#8882_0_25%,transparent_0_50%)] bg-size-[16px_16px] p-4">
            <img src={decoded.url} alt="Decoded" className="max-h-80 max-w-full" />
          </div>
          <Button onClick={() => downloadBlob(decoded.blob, `image.${decoded.ext}`)}>
            <Download /> Download {decoded.ext.toUpperCase()} ({formatBytes(decoded.blob.size)})
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ImageToBase64() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  return (
    <ToolCard>
      <OptionPicker
        value={mode}
        onChange={setMode}
        options={[
          { value: "encode", label: "Image → Base64" },
          { value: "decode", label: "Base64 → Image" },
        ]}
      />
      {mode === "encode" ? <Encode /> : <Decode />}
    </ToolCard>
  );
}
