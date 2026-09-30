"use client";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { matchesAccept } from "@/lib/files";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  /** Also accept files pasted with Ctrl+V anywhere on the page. */
  allowPaste?: boolean;
  compact?: boolean;
  className?: string;
};

export default function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  label,
  hint,
  allowPaste = true,
  compact = false,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Keep the latest callback without re-binding the paste listener.
  const handleRef = useRef<(files: File[]) => void>(null);
  handleRef.current = (incoming: File[]) => {
    const accepted = incoming.filter((file) => matchesAccept(file, accept));
    if (accepted.length < incoming.length) {
      toast.error(
        accepted.length === 0
          ? "That file type isn't supported here."
          : `Skipped ${incoming.length - accepted.length} unsupported file(s).`,
      );
    }
    if (accepted.length === 0) return;
    onFiles(multiple ? accepted : accepted.slice(0, 1));
  };

  useEffect(() => {
    if (!allowPaste) return;
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length > 0) {
        event.preventDefault();
        handleRef.current?.(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [allowPaste]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleRef.current?.(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "p-4" : "p-8 sm:p-10",
        dragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/40",
        className,
      )}
    >
      <div className="rounded-full bg-primary/10 p-3 text-primary">
        <Upload className="h-6 w-6" />
      </div>
      <p className="font-medium">
        {label ?? (multiple ? "Drop files here or click to browse" : "Drop a file here or click to browse")}
      </p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {allowPaste && !compact && (
        <p className="text-xs text-muted-foreground">You can also paste with Ctrl+V</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          handleRef.current?.(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
