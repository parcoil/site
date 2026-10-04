"use client";
import { useState } from "react";
import { Download, MapPin, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/tools/FileDropzone";
import ToolCard from "@/components/tools/ToolCard";
import { baseName, downloadBlob, formatBytes, replaceExtension } from "@/lib/files";
import { type MetadataReport, readMetadata, stripMetadata } from "@/lib/exif";
import { encodeImage, loadImage, renderToCanvas } from "@/lib/image";
import { createZip } from "@/lib/zip";

type Entry = { id: number; file: File; report: MetadataReport; clean: Blob; cleanName: string };

let nextId = 1;

async function analyze(file: File): Promise<Entry> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const report = readMetadata(bytes);
  const stripped = stripMetadata(bytes);
  if (stripped) {
    return {
      id: nextId++,
      file,
      report,
      clean: new Blob([stripped as BlobPart], { type: file.type }),
      cleanName: `${baseName(file.name)}-clean.${file.name.split(".").pop()}`,
    };
  }
  // Other formats: redraw the pixels into a fresh PNG, which carries no metadata.
  const canvas = renderToCanvas(await loadImage(file));
  return {
    id: nextId++,
    file,
    report,
    clean: await encodeImage(canvas, "png"),
    cleanName: replaceExtension(`${baseName(file.name)}-clean`, "png"),
  };
}

function EntryCard({ entry, onRemove }: { entry: Entry; onRemove: () => void }) {
  const { file, report, clean, cleanName } = entry;
  const groups = ["Location", "Camera", "Photo", "File"] as const;
  const hasMetadata = report.blocks.length > 0;

  return (
    <li className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium" title={file.name}>{file.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatBytes(file.size)} → {formatBytes(clean.size)}</span>
            {report.gps && (
              <Badge variant="destructive" className="gap-1">
                <MapPin className="h-3 w-3" /> Contains GPS location
              </Badge>
            )}
            {hasMetadata ? (
              report.blocks.map((block) => (
                <Badge key={block} variant="secondary">{block}</Badge>
              ))
            ) : (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ShieldCheck className="h-3.5 w-3.5" /> No metadata found
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadBlob(clean, cleanName)}>
          <Download /> Clean copy
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${file.name}`}>
          <X />
        </Button>
      </div>

      {report.fields.length > 0 && (
        <details className="group rounded-md bg-muted/30 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium">
            Show {report.fields.length} metadata fields
          </summary>
          <div className="mt-3 space-y-3">
            {groups.map((group) => {
              const fields = report.fields.filter((f) => f.group === group);
              if (fields.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{group}</p>
                  <dl className="mt-1 grid grid-cols-[minmax(0,10rem)_1fr] gap-x-4 gap-y-1">
                    {fields.map((f, i) => (
                      <div key={i} className="contents">
                        <dt className="text-muted-foreground">{f.label}</dt>
                        <dd className="wrap-break-word">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
            {report.gps && (
              <a
                className="inline-flex items-center gap-1 text-primary hover:underline"
                href={`https://www.openstreetmap.org/?mlat=${report.gps.latitude}&mlon=${report.gps.longitude}#map=15/${report.gps.latitude}/${report.gps.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="h-4 w-4" /> See where this photo was taken
              </a>
            )}
          </div>
        </details>
      )}
      {report.orientation && report.orientation !== 1 && (
        <p className="text-xs text-muted-foreground">
          The orientation tag is kept in the clean copy so the photo still displays the right way up.
        </p>
      )}
    </li>
  );
}

export default function ExifRemover() {
  const [entries, setEntries] = useState<Entry[]>([]);

  const addFiles = async (files: File[]) => {
    const results = await Promise.allSettled(files.map(analyze));
    const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (ok.length < files.length) toast.error(`${files.length - ok.length} file(s) couldn't be read.`);
    setEntries((list) => [...list, ...ok]);
  };

  const downloadAll = async () => {
    if (entries.length === 1) return downloadBlob(entries[0].clean, entries[0].cleanName);
    const zip = await createZip(entries.map((e) => ({ name: e.cleanName, data: e.clean })));
    downloadBlob(zip, "clean-photos.zip");
  };

  return (
    <ToolCard>
      <FileDropzone
        multiple
        accept="image/*"
        onFiles={addFiles}
        label={entries.length ? "Add more photos" : "Drop photos to check their metadata"}
        hint="JPG, PNG and WebP are cleaned without any quality loss. Nothing is uploaded."
        compact={entries.length > 0}
      />

      {entries.length > 0 && (
        <>
          <ul className="space-y-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onRemove={() => setEntries((list) => list.filter((e) => e.id !== entry.id))}
              />
            ))}
          </ul>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setEntries([])}>
              <Trash2 /> Clear
            </Button>
            <Button onClick={downloadAll}>
              <Download /> Download {entries.length > 1 ? `all ${entries.length} clean copies (ZIP)` : "clean copy"}
            </Button>
          </div>
        </>
      )}
    </ToolCard>
  );
}
