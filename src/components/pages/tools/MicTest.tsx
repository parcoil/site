"use client";
import { useEffect, useRef, useState } from "react";
import { Circle, Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SwitchField } from "@/components/tools/fields";
import { Detail, DetailGrid } from "@/components/tools/stats";
import { useMediaDevices, useMediaStream } from "@/hooks/use-media-stream";

const MAX_RECORDING_MS = 10000;

export default function MicTest() {
  const { stream, error, start, stop } = useMediaStream("microphone");
  const devices = useMediaDevices("audioinput", stream);
  const [deviceId, setDeviceId] = useState("");
  const [processing, setProcessing] = useState(true);
  const [level, setLevel] = useState(-100);
  const [peak, setPeak] = useState(-100);
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);

  const open = (id = deviceId, process = processing) =>
    start({
      audio: {
        deviceId: id ? { exact: id } : undefined,
        echoCancellation: process,
        noiseSuppression: process,
        autoGainControl: process,
      },
    });

  // Analyse the live signal: RMS level in dBFS plus a scrolling waveform.
  useEffect(() => {
    if (!stream) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const color = getComputedStyle(canvas).color;
    let frame = 0;
    let peakHold = -100;

    const draw = () => {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += s * s;
      const db = Math.max(-100, 20 * Math.log10(Math.sqrt(sum / samples.length) || 1e-5));
      peakHold = Math.max(db, peakHold - 0.3);
      setLevel(db);
      setPeak(peakHold);

      const width = (canvas.width = canvas.clientWidth * devicePixelRatio);
      const height = (canvas.height = canvas.clientHeight * devicePixelRatio);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.beginPath();
      for (let i = 0; i < samples.length; i++) {
        const x = (i / samples.length) * width;
        const y = ((1 - samples[i]) / 2) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      context.close();
    };
  }, [stream]);

  useEffect(() => () => {
    if (clip) URL.revokeObjectURL(clip);
  }, [clip]);

  const record = () => {
    if (!stream) return;
    if (recording) {
      recorder.current?.stop();
      return;
    }
    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      setRecording(false);
      setClip(URL.createObjectURL(new Blob(chunks, { type: mediaRecorder.mimeType })));
    };
    mediaRecorder.start();
    recorder.current = mediaRecorder;
    setRecording(true);
    setTimeout(() => mediaRecorder.state === "recording" && mediaRecorder.stop(), MAX_RECORDING_MS);
  };

  const track = stream?.getAudioTracks()[0];
  const settings = track?.getSettings();
  const percent = Math.min(100, Math.max(0, ((level + 60) / 60) * 100));
  const peakPercent = Math.min(100, Math.max(0, ((peak + 60) / 60) * 100));
  const hearing = level > -50;

  return (
    <ToolCard className="max-w-3xl">
      {!stream ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Mic className="h-12 w-12 text-primary" />
          {error ? <p className="max-w-md text-sm text-destructive">{error}</p> : <p className="text-muted-foreground">Your audio is analysed on this device and never uploaded.</p>}
          <Button size="lg" onClick={() => open()}>
            <Mic /> Start microphone
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={hearing ? "font-medium text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {hearing ? "✓ We can hear you" : "Say something…"}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">{level.toFixed(0)} dB</span>
            </div>
            {/* Full-width gradient, with the unlit part covered from the right. */}
            <div className="relative h-4 overflow-hidden rounded-full bg-linear-to-r from-green-500 via-yellow-400 to-red-500">
              <div
                className="absolute inset-y-0 right-0 bg-muted transition-[width] duration-75"
                style={{ width: `${100 - percent}%` }}
              />
              <div className="absolute top-0 h-full w-0.5 bg-foreground" style={{ left: `${peakPercent}%` }} />
            </div>
          </div>
          <canvas ref={canvasRef} className="h-32 w-full rounded-lg border bg-muted/30 text-primary" />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={stop}>
              <MicOff /> Stop
            </Button>
            <Button onClick={record} variant={recording ? "destructive" : "default"}>
              {recording ? <Square /> : <Circle />}
              {recording ? "Stop recording" : "Record a test clip"}
            </Button>
          </div>
          {clip && !recording && (
            <Field label="Your recording">
              <audio src={clip} controls className="w-full" />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {devices.length > 1 && (
              <Field label="Microphone">
                <Select
                  value={settings?.deviceId ?? deviceId}
                  onValueChange={(id) => {
                    setDeviceId(id);
                    open(id);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((d, i) => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microphone ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <SwitchField
              label="Noise suppression & echo cancellation"
              description="Turn off to hear your raw microphone."
              checked={processing}
              onChange={(on) => {
                setProcessing(on);
                open(deviceId, on);
              }}
            />
          </div>

          <DetailGrid>
            <Detail label="Device" value={track?.label} />
            <Detail label="Sample rate" value={settings?.sampleRate ? `${settings.sampleRate} Hz` : undefined} />
            <Detail label="Channels" value={settings?.channelCount ? String(settings.channelCount) : undefined} />
          </DetailGrid>
        </>
      )}
    </ToolCard>
  );
}
