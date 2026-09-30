"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Film, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { formatDuration } from "@/lib/audio";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";
import { GifEncoder } from "@/lib/gif";

const WIDTHS = ["240", "320", "480", "640"] as const;
const FPS = ["5", "10", "15", "20"] as const;

function seek(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve) => {
    video.addEventListener("seeked", () => resolve(), { once: true });
    video.currentTime = time;
  });
}

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState<(typeof WIDTHS)[number]>("480");
  const [fps, setFps] = useState<(typeof FPS)[number]>("10");
  const [dither, setDither] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  }, [file, start, length, width, fps, dither]);

  const clipEnd = Math.min(duration, start + length);

  const generate = async () => {
    if (!url) return;
    cancelRef.current = false;
    setProgress(0);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("This video couldn't be read."));
      });
      const outWidth = Number(width);
      const outHeight = Math.round((outWidth * video.videoHeight) / video.videoWidth / 2) * 2;
      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const encoder = new GifEncoder(outWidth, outHeight);
      const step = 1 / Number(fps);
      const frames = Math.max(1, Math.floor((clipEnd - start) / step));

      for (let i = 0; i < frames; i++) {
        if (cancelRef.current) return;
        await seek(video, start + i * step);
        ctx.drawImage(video, 0, 0, outWidth, outHeight);
        encoder.addFrame(ctx.getImageData(0, 0, outWidth, outHeight), step * 1000, dither);
        setProgress((i + 1) / frames);
      }
      const blob = encoder.finish();
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the GIF.");
    } finally {
      setProgress(null);
      video.removeAttribute("src");
      video.load();
    }
  };

  if (!file || !url) {
    return (
      <ToolCard>
        <FileDropzone
          accept="video/*,.mkv,.mov"
          onFiles={([f]) => setFile(f)}
          label="Drop a video to turn into a GIF"
          hint="MP4, WebM or MOV. Short clips make the best GIFs."
        />
      </ToolCard>
    );
  }

  return (
    <ToolCard>
      <FileInfoBar
        file={file}
        detail={duration ? formatDuration(duration) : undefined}
        onClear={() => {
          cancelRef.current = true;
          setFile(null);
          setUrl(null);
          setDuration(0);
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <video
            ref={previewRef}
            src={url}
            controls
            muted
            className="w-full rounded-lg border bg-black"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              setDuration(d);
              setStart(0);
              setLength(Math.min(3, Math.floor(d * 10) / 10 || 1));
            }}
          />
          <p className="text-xs text-muted-foreground">
            Tip: pause the video where you want the GIF to begin and click &ldquo;Use current time&rdquo;.
          </p>
        </div>

        <div className="space-y-5">
          <SliderField
            label="Start"
            value={start}
            onChange={(v) => {
              setStart(v);
              if (previewRef.current) previewRef.current.currentTime = v;
            }}
            min={0}
            max={Math.max(0, duration - 0.1)}
            step={0.1}
            format={(v) => formatDuration(v, true)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStart(Math.floor((previewRef.current?.currentTime ?? 0) * 10) / 10)}
          >
            Use current time
          </Button>
          <SliderField
            label="Length"
            value={length}
            onChange={setLength}
            min={0.5}
            max={Math.max(0.5, Math.min(20, duration))}
            step={0.5}
            format={(v) => `${v.toFixed(1)} s`}
          />
          <Field label="Width">
            <OptionPicker value={width} onChange={setWidth} options={WIDTHS.map((w) => ({ value: w, label: `${w}px` }))} />
          </Field>
          <Field label="Frame rate">
            <OptionPicker value={fps} onChange={setFps} options={FPS.map((f) => ({ value: f, label: `${f} fps` }))} />
          </Field>
          <SwitchField
            label="Dithering"
            description="Smoother gradients, but a larger file."
            checked={dither}
            onChange={setDither}
          />
        </div>
      </div>

      {result ? (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <img src={result.url} alt="Generated GIF" className="mx-auto max-h-80 rounded" />
          <Button onClick={() => downloadBlob(result.blob, `${baseName(file.name)}.gif`)} className="w-full sm:w-auto">
            <Download /> Download GIF ({formatBytes(result.blob.size)})
          </Button>
        </div>
      ) : progress !== null ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {Math.round(progress * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={() => (cancelRef.current = true)}>
            <X /> Cancel
          </Button>
        </div>
      ) : (
        <Button onClick={generate} disabled={!duration} className="w-full sm:w-auto">
          <Film /> Create GIF ({formatDuration(start, true)} – {formatDuration(clipEnd, true)})
        </Button>
      )}
    </ToolCard>
  );
}
