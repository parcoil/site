"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Download, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/tools/FileDropzone";
import ToolCard from "@/components/tools/ToolCard";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { downloadBlob, formatBytes } from "@/lib/files";
import { imageSize, loadImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import { createZip } from "@/lib/zip";

export type ProcessedImage = { blob: Blob; name: string; width?: number; height?: number };

type Item = {
  id: number;
  file: File;
  preview: string;
  width?: number;
  height?: number;
  status: "pending" | "processing" | "done" | "error";
  result?: ProcessedImage & { url: string };
  /** Settings the current result was made with. */
  resultKey?: string;
  error?: string;
};

type BatchImageToolProps = {
  /** Settings controls shown above the file list. */
  settings: ReactNode;
  /** Serializable snapshot of the settings; results are regenerated when it changes. */
  settingsKey: string;
  process: (file: File, image: HTMLImageElement) => Promise<ProcessedImage>;
  accept?: string;
  dropLabel?: string;
  dropHint?: string;
  zipName?: string;
};

let nextId = 1;

export default function BatchImageTool({
  settings,
  settingsKey,
  process,
  accept = "image/*,.svg,.ico",
  dropLabel = "Drop images here or click to browse",
  dropHint = "PNG, JPG, WebP, AVIF, GIF, BMP, SVG or ICO. Your images never leave your device.",
  zipName = "images.zip",
}: BatchImageToolProps) {
  const [items, setItems] = useState<Item[]>([]);
  const images = useRef(new Map<number, HTMLImageElement>());
  const processRef = useRef(process);
  processRef.current = process;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const debouncedKey = useDebouncedValue(settingsKey, 250);
  const ids = items.map((i) => i.id).join(",");

  const update = (id: number, patch: Partial<Item>) =>
    setItems((list) =>
      list.map((item) => {
        if (item.id !== id) return item;
        if (patch.result && item.result) URL.revokeObjectURL(item.result.url);
        return { ...item, ...patch };
      }),
    );

  // Process items that are new or were made with older settings. A newer run
  // cancels an older one between files.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const { id, file, resultKey } of itemsRef.current) {
        if (cancelled) return;
        if (resultKey === debouncedKey) continue;
        update(id, { status: "processing" });
        try {
          let image = images.current.get(id);
          if (!image) {
            image = await loadImage(file);
            images.current.set(id, image);
            update(id, imageSize(image));
          }
          const result = await processRef.current(file, image);
          if (cancelled) return;
          update(id, {
            status: "done",
            error: undefined,
            resultKey: debouncedKey,
            result: { ...result, url: URL.createObjectURL(result.blob) },
          });
        } catch (e) {
          if (!cancelled) {
            update(id, { status: "error", error: e instanceof Error ? e.message : "Failed" });
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids, debouncedKey]);

  // Release object URLs on unmount.
  useEffect(
    () => () =>
      itemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.preview);
        if (item.result) URL.revokeObjectURL(item.result.url);
      }),
    [],
  );

  const addFiles = (files: File[]) =>
    setItems((list) => [
      ...list,
      ...files.map((file) => ({
        id: nextId++,
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      })),
    ]);

  const remove = (id: number) =>
    setItems((list) => {
      const item = list.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
      images.current.delete(id);
      return list.filter((i) => i.id !== id);
    });

  const clear = () => {
    items.forEach((item) => remove(item.id));
  };

  const done = items.filter((i) => i.status === "done" && i.result);
  const busy = items.some((i) => i.status === "processing" || i.status === "pending");
  const totalIn = done.reduce((sum, i) => sum + i.file.size, 0);
  const totalOut = done.reduce((sum, i) => sum + i.result!.blob.size, 0);

  const downloadAll = async () => {
    if (done.length === 1) {
      downloadBlob(done[0].result!.blob, done[0].result!.name);
      return;
    }
    const toastId = toast.loading("Creating ZIP…");
    const zip = await createZip(done.map((i) => ({ name: i.result!.name, data: i.result!.blob })));
    toast.dismiss(toastId);
    downloadBlob(zip, zipName);
  };

  return (
    <ToolCard>
      <FileDropzone
        multiple
        accept={accept}
        onFiles={addFiles}
        label={items.length ? "Add more images" : dropLabel}
        hint={dropHint}
        compact={items.length > 0}
      />

      {settings}

      {items.length > 0 && (
        <div className="space-y-3">
          <ul className="divide-y rounded-lg border">
            {items.map((item) => (
              <ImageRow key={item.id} item={item} onRemove={() => remove(item.id)} />
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {done.length} of {items.length} ready
              {done.length > 0 && (
                <>
                  {" · "}
                  {formatBytes(totalIn)} → {formatBytes(totalOut)}
                  <SizeChange before={totalIn} after={totalOut} />
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clear}>
                <Trash2 /> Clear
              </Button>
              <Button onClick={downloadAll} disabled={busy || done.length === 0}>
                <Download />
                {done.length > 1 ? `Download all (${done.length}) as ZIP` : "Download"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ToolCard>
  );
}

function SizeChange({ before, after }: { before: number; after: number }) {
  if (!before) return null;
  const change = Math.round(((after - before) / before) * 100);
  if (change === 0) return null;
  return (
    <span className={cn("ml-1 font-medium", change < 0 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
      ({change > 0 ? "+" : ""}
      {change}%)
    </span>
  );
}

function ImageRow({ item, onRemove }: { item: Item; onRemove: () => void }) {
  const { file, result } = item;
  return (
    <li className="flex items-center gap-3 p-3">
      <img
        src={result?.url ?? item.preview}
        alt=""
        className="h-14 w-14 shrink-0 rounded-md border bg-[repeating-conic-gradient(#8882_0_25%,transparent_0_50%)] bg-size-[12px_12px] object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={file.name}>
          {result?.name ?? file.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
          <span>
            {formatBytes(file.size)}
            {item.width ? ` · ${item.width}×${item.height}` : ""}
          </span>
          {result && (
            <>
              <ArrowRight className="h-3 w-3" />
              <span className="text-foreground">
                {formatBytes(result.blob.size)}
                {result.width ? ` · ${result.width}×${result.height}` : ""}
              </span>
              <SizeChange before={file.size} after={result.blob.size} />
            </>
          )}
        </p>
        {item.status === "error" && <p className="text-xs text-destructive">{item.error}</p>}
      </div>
      {item.status === "processing" || item.status === "pending" ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Processing" />
      ) : (
        result && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => downloadBlob(result.blob, result.name)}
            aria-label={`Download ${result.name}`}
          >
            <Download />
          </Button>
        )
      )}
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${file.name}`}>
        <X />
      </Button>
    </li>
  );
}
