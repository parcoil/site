"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Download, FlipHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker } from "@/components/tools/fields";
import { Detail, DetailGrid } from "@/components/tools/stats";
import { useMediaDevices, useMediaStream } from "@/hooks/use-media-stream";
import { canvasToBlob } from "@/lib/image";
import { downloadBlob } from "@/lib/files";

const RESOLUTIONS = {
  "480": { width: 640, height: 480 },
  "720": { width: 1280, height: 720 },
  "1080": { width: 1920, height: 1080 },
  "2160": { width: 3840, height: 2160 },
} as const;
type Resolution = keyof typeof RESOLUTIONS;

export default function WebcamTest() {
  const { stream, error, start, stop } = useMediaStream("camera");
  const devices = useMediaDevices("videoinput", stream);
  const [deviceId, setDeviceId] = useState("");
  const [resolution, setResolution] = useState<Resolution>("1080");
  const [mirror, setMirror] = useState(true);
  const [fps, setFps] = useState(0);
  const [settings, setSettings] = useState<MediaTrackSettings | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const open = (id = deviceId, res = resolution) =>
    start({
      video: {
        deviceId: id ? { exact: id } : undefined,
        width: { ideal: RESOLUTIONS[res].width },
        height: { ideal: RESOLUTIONS[res].height },
      },
    });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) {
      setSettings(null);
      return;
    }
    video.srcObject = stream;
    const track = stream.getVideoTracks()[0];
    const update = () => setSettings(track.getSettings());
    video.onloadedmetadata = update;
    update();

    // Count frames actually delivered to measure the real frame rate.
    let frames = 0;
    let handle = 0;
    const onFrame = () => {
      frames++;
      handle = video.requestVideoFrameCallback(onFrame);
    };
    if ("requestVideoFrameCallback" in video) handle = video.requestVideoFrameCallback(onFrame);
    const id = setInterval(() => {
      setFps(frames);
      frames = 0;
    }, 1000);
    return () => {
      clearInterval(id);
      if ("cancelVideoFrameCallback" in video) video.cancelVideoFrameCallback(handle);
    };
  }, [stream]);

  const snapshot = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    downloadBlob(await canvasToBlob(canvas, "image/png"), `webcam-${Date.now()}.png`);
  };

  const label = devices.find((d) => d.deviceId === settings?.deviceId)?.label;

  return (
    <ToolCard>
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-contain ${mirror ? "-scale-x-100" : ""} ${stream ? "" : "hidden"}`}
        />
        {!stream && (
          <div className="flex flex-col items-center gap-3 p-6 text-center text-white">
            <Camera className="h-12 w-12 opacity-70" />
            {error ? <p className="max-w-md text-sm text-red-300">{error}</p> : <p className="text-sm opacity-80">Your camera feed stays on this device.</p>}
            <Button onClick={() => open()}>
              <Camera /> Start camera
            </Button>
          </div>
        )}
        {stream && fps > 0 && (
          <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 font-mono text-xs text-white">
            {settings?.width}×{settings?.height} · {fps} fps
          </span>
        )}
      </div>

      {stream && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={stop}>
              <CameraOff /> Stop
            </Button>
            <Button variant="outline" onClick={() => setMirror(!mirror)}>
              <FlipHorizontal /> {mirror ? "Unmirror" : "Mirror"}
            </Button>
            <Button onClick={snapshot}>
              <Download /> Take snapshot
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {devices.length > 1 && (
              <Field label="Camera">
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
                        {d.label || `Camera ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="Requested resolution">
              <OptionPicker
                value={resolution}
                onChange={(r) => {
                  setResolution(r);
                  open(deviceId, r);
                }}
                options={(Object.keys(RESOLUTIONS) as Resolution[]).map((r) => ({ value: r, label: r === "2160" ? "4K" : `${r}p` }))}
              />
            </Field>
          </div>

          <DetailGrid>
            <Detail label="Camera" value={label} />
            <Detail label="Resolution" value={settings?.width ? `${settings.width}×${settings.height}` : undefined} />
            <Detail label="Measured frame rate" value={fps ? `${fps} fps` : undefined} />
            <Detail label="Reported frame rate" value={settings?.frameRate ? `${Math.round(settings.frameRate)} fps` : undefined} />
            <Detail label="Aspect ratio" value={settings?.aspectRatio?.toFixed(2)} />
            <Detail label="Facing" value={settings?.facingMode} />
          </DetailGrid>
        </>
      )}
    </ToolCard>
  );
}
