"use client";
import type { ReactNode } from "react";
import { FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/files";

/** Shows the selected file with a button to remove it. */
export default function FileInfoBar({
  file,
  detail,
  onClear,
  thumbnail,
}: {
  file: File;
  detail?: ReactNode;
  onClear: () => void;
  thumbnail?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      {thumbnail ? (
        <img src={thumbnail} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
      ) : (
        <FileIcon className="h-5 w-5 shrink-0 text-primary" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatBytes(file.size)}
          {detail && <> · {detail}</>}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onClear} aria-label="Remove file">
        <X />
      </Button>
    </div>
  );
}
