import { useCallback, useEffect, useRef, useState } from "react";

function describeError(error: unknown, device: string) {
  const name = error instanceof DOMException ? error.name : "";
  switch (name) {
    case "NotAllowedError":
      return `Permission to use your ${device} was denied. Allow access in your browser's address bar and try again.`;
    case "NotFoundError":
      return `No ${device} was found. Check that it's plugged in.`;
    case "NotReadableError":
      return `Your ${device} is in use by another app, or your system blocked access. Close other apps using it and try again.`;
    case "OverconstrainedError":
      return `Your ${device} doesn't support those settings.`;
    default:
      return typeof navigator !== "undefined" && !navigator.mediaDevices
        ? `This browser can't access a ${device}. Make sure the page is loaded over HTTPS.`
        : `Couldn't start your ${device}.`;
  }
}

/** Starts and stops a camera or microphone stream, stopping it on unmount. */
export function useMediaStream(device: "camera" | "microphone") {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    current.current?.getTracks().forEach((track) => track.stop());
    current.current = null;
    setStream(null);
  }, []);

  const start = useCallback(
    async (constraints: MediaStreamConstraints) => {
      stop();
      try {
        const next = await navigator.mediaDevices.getUserMedia(constraints);
        current.current = next;
        setStream(next);
        setError(null);
        return next;
      } catch (e) {
        setError(describeError(e, device));
        return null;
      }
    },
    [stop, device],
  );

  useEffect(() => stop, [stop]);

  return { stream, error, start, stop };
}

/** Lists input devices of a kind. Labels only appear after permission is granted. */
export function useMediaDevices(kind: MediaDeviceKind, refreshKey: unknown) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const load = () =>
      navigator.mediaDevices.enumerateDevices().then((all) => setDevices(all.filter((d) => d.kind === kind && d.deviceId)));
    load();
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () => navigator.mediaDevices.removeEventListener("devicechange", load);
  }, [kind, refreshKey]);
  return devices;
}
