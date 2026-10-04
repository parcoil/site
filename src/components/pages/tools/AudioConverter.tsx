"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Play, Square, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import {
  decodeAudio,
  encodeMp3,
  encodeWav,
  formatDuration,
  prepareChannels,
  waveformPeaks,
} from "@/lib/audio";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

type Format = "mp3" | "wav";
const BITRATES = ["96", "128", "192", "256", "320"] as const;

function Waveform({ buffer, range }: { buffer: AudioBuffer; range: [number, number] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const width = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const height = (canvas.height = canvas.clientHeight * devicePixelRatio);
    const ctx = canvas.getContext("2d")!;
    const color = getComputedStyle(canvas).color; // text-primary
    const peaks = waveformPeaks(buffer, Math.floor(width / 2));
    const startX = (range[0] / buffer.duration) * width;
    const endX = (range[1] / buffer.duration) * width;
    ctx.clearRect(0, 0, width, height);
    peaks.forEach(([min, max], i) => {
      const x = i * 2;
      ctx.globalAlpha = x >= startX && x <= endX ? 1 : 0.25;
      ctx.fillStyle = color;
      const top = ((1 - max) / 2) * height;
      ctx.fillRect(x, top, 1.5, Math.max(1, ((max - min) / 2) * height));
    });
  }, [buffer, range]);

  return <canvas ref={ref} className="h-24 w-full rounded-md bg-muted/40 text-primary" />;
}

export default function AudioConverter({ video = false }: { video?: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [format, setFormat] = useState<Format>("mp3");
  const [bitrate, setBitrate] = useState<(typeof BITRATES)[number]>("192");
  const [sampleRate, setSampleRate] = useState<"44100" | "48000">("44100");
  const [mono, setMono] = useState(false);
  const [normalize, setNormalize] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const player = useRef<{ context: AudioContext; source: AudioBufferSourceNode } | null>(null);

  const stopPreview = () => {
    player.current?.source.stop();
    player.current?.context.close();
    player.current = null;
    setPlaying(false);
  };

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setDecoding(true);
    setBuffer(null);
    decodeAudio(file, Number(sampleRate))
      .then((decoded) => {
        if (cancelled) return;
        setBuffer(decoded);
        setRange([0, decoded.duration]);
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(e.message);
          setFile(null);
        }
      })
      .finally(() => !cancelled && setDecoding(false));
    return () => {
      cancelled = true;
    };
  }, [file, sampleRate]);

  // Any change makes the previous result stale.
  useEffect(() => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  }, [buffer, range, format, bitrate, mono, normalize]);

  useEffect(() => stopPreview, []);

  const togglePreview = () => {
    if (playing || !buffer) return stopPreview();
    const context = new AudioContext();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.onended = stopPreview;
    source.start(0, range[0], range[1] - range[0]);
    player.current = { context, source };
    setPlaying(true);
  };

  const convert = async () => {
    if (!buffer || !file) return;
    setProgress(0);
    try {
      const channels = prepareChannels(buffer, { start: range[0], end: range[1], mono, normalize });
      const blob =
        format === "mp3"
          ? await encodeMp3(channels, buffer.sampleRate, Number(bitrate), setProgress)
          : encodeWav(channels, buffer.sampleRate);
      setResult({ blob, url: URL.createObjectURL(blob), name: `${baseName(file.name)}.${format}` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setProgress(null);
    }
  };

  const clipLength = range[1] - range[0];
  const channelsOut = mono ? 1 : Math.min(2, buffer?.numberOfChannels ?? 2);
  const estimate =
    format === "mp3"
      ? (Number(bitrate) * 1000 * clipLength) / 8
      : Number(sampleRate) * channelsOut * 2 * clipLength;

  if (!file) {
    return (
      <ToolCard>
        <FileDropzone
          accept={video ? "video/*,.mkv,.mov" : "audio/*,video/*,.m4a,.flac,.opus,.aac,.wma"}
          onFiles={([f]) => setFile(f)}
          label={video ? "Drop a video to extract its audio" : "Drop an audio file"}
          hint={
            video
              ? "MP4, WebM, MOV and more. The video never leaves your device."
              : "MP3, WAV, OGG, FLAC, M4A, AAC, Opus and video files. Nothing is uploaded."
          }
        />
      </ToolCard>
    );
  }

  return (
    <ToolCard>
      <FileInfoBar
        file={file}
        detail={buffer && `${formatDuration(buffer.duration)} · ${buffer.numberOfChannels === 1 ? "mono" : "stereo"}`}
        onClear={() => {
          stopPreview();
          setFile(null);
          setBuffer(null);
        }}
      />

      {decoding || !buffer ? (
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Decoding audio…
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <Waveform buffer={buffer} range={range} />
            <Slider
              aria-label="Trim"
              value={range}
              onValueChange={([start, end]) => setRange([start, end])}
              min={0}
              max={buffer.duration}
              step={0.1}
              minStepsBetweenThumbs={1}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                Trim: {formatDuration(range[0], true)} – {formatDuration(range[1], true)} ({formatDuration(clipLength, true)})
              </span>
              <Button variant="outline" size="sm" onClick={togglePreview}>
                {playing ? <Square /> : <Play />} {playing ? "Stop" : "Preview"}
              </Button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Convert to">
              <OptionPicker
                value={format}
                onChange={setFormat}
                options={[
                  { value: "mp3", label: "MP3" },
                  { value: "wav", label: "WAV" },
                ]}
              />
            </Field>
            {format === "mp3" && (
              <Field label="Bitrate">
                <OptionPicker
                  value={bitrate}
                  onChange={setBitrate}
                  options={BITRATES.map((b) => ({ value: b, label: `${b}k` }))}
                />
              </Field>
            )}
            <Field label="Sample rate">
              <OptionPicker
                value={sampleRate}
                onChange={setSampleRate}
                options={[
                  { value: "44100", label: "44.1 kHz" },
                  { value: "48000", label: "48 kHz" },
                ]}
              />
            </Field>
            <div className="space-y-3">
              <SwitchField label="Convert to mono" checked={mono} onChange={setMono} />
              <SwitchField label="Normalize volume" checked={normalize} onChange={setNormalize} />
            </div>
          </div>

          {result ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <audio src={result.url} controls className="w-full" />
              <Button onClick={() => downloadBlob(result.blob, result.name)} className="w-full sm:w-auto">
                <Download /> Download {result.name} ({formatBytes(result.blob.size)})
              </Button>
            </div>
          ) : (
            <Button onClick={convert} disabled={progress !== null} className="w-full sm:w-auto">
              {progress !== null ? (
                <>
                  <Loader2 className="animate-spin" /> Converting… {Math.round(progress * 100)}%
                </>
              ) : (
                <>
                  <Wand2 /> Convert to {format.toUpperCase()} (about {formatBytes(estimate)})
                </>
              )}
            </Button>
          )}
        </>
      )}
    </ToolCard>
  );
}
