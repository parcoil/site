// Browser-side audio decoding and encoding (WAV natively, MP3 via LAME).
import { Mp3Encoder } from "@breezystack/lamejs";

/** Decodes any format the browser supports, including the audio track of most videos. */
export async function decodeAudio(file: Blob, sampleRate = 44100): Promise<AudioBuffer> {
  const data = await file.arrayBuffer();
  // Decoding through an offline context resamples straight to the target rate.
  const context = new OfflineAudioContext(1, 1, sampleRate);
  try {
    return await context.decodeAudioData(data);
  } catch {
    throw new Error("This file's audio couldn't be decoded. It may have no audio track or use an unsupported codec.");
  }
}

export type AudioEdit = {
  start?: number;
  end?: number;
  mono?: boolean;
  normalize?: boolean;
};

/** Trims, downmixes and normalizes into plain Float32 channel arrays. */
export function prepareChannels(buffer: AudioBuffer, { start = 0, end = buffer.duration, mono = false, normalize = false }: AudioEdit) {
  const from = Math.max(0, Math.floor(start * buffer.sampleRate));
  const to = Math.min(buffer.length, Math.ceil(end * buffer.sampleRate));
  let channels = Array.from({ length: buffer.numberOfChannels }, (_, c) =>
    buffer.getChannelData(c).slice(from, to),
  );
  if (mono && channels.length > 1) {
    const mixed = new Float32Array(to - from);
    for (const channel of channels) for (let i = 0; i < mixed.length; i++) mixed[i] += channel[i] / channels.length;
    channels = [mixed];
  }
  channels = channels.slice(0, 2);
  if (normalize) {
    let peak = 0;
    for (const channel of channels) for (let i = 0; i < channel.length; i++) peak = Math.max(peak, Math.abs(channel[i]));
    if (peak > 0) {
      const gain = 0.98 / peak;
      for (const channel of channels) for (let i = 0; i < channel.length; i++) channel[i] *= gain;
    }
  }
  return channels;
}

const toInt16 = (sample: number) => {
  const s = Math.max(-1, Math.min(1, sample));
  return s < 0 ? s * 0x8000 : s * 0x7fff;
};

export function encodeWav(channels: Float32Array[], sampleRate: number): Blob {
  const count = channels.length;
  const frames = channels[0]?.length ?? 0;
  const dataSize = frames * count * 2;
  const view = new DataView(new ArrayBuffer(44 + dataSize));
  const text = (offset: number, value: string) =>
    [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, count, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * count * 2, true);
  view.setUint16(32, count * 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < count; c++) {
      view.setInt16(offset, toInt16(channels[c][i]), true);
      offset += 2;
    }
  }
  return new Blob([view.buffer], { type: "audio/wav" });
}

/** Encodes in chunks, yielding to the browser so the page stays responsive. */
export async function encodeMp3(
  channels: Float32Array[],
  sampleRate: number,
  kbps: number,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  const encoder = new Mp3Encoder(channels.length, sampleRate, kbps);
  const frames = channels[0]?.length ?? 0;
  const chunk = 1152 * 20;
  const parts: BlobPart[] = [];
  for (let offset = 0; offset < frames; offset += chunk) {
    const pcm = channels.map((channel) => Int16Array.from(channel.subarray(offset, offset + chunk), toInt16));
    parts.push(encoder.encodeBuffer(pcm[0], pcm[1]) as BlobPart);
    if ((offset / chunk) % 25 === 0) {
      onProgress?.(offset / frames);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  parts.push(encoder.flush() as BlobPart);
  onProgress?.(1);
  return new Blob(parts, { type: "audio/mpeg" });
}

/** Min/max pairs per column for drawing a waveform. */
export function waveformPeaks(buffer: AudioBuffer, columns: number) {
  const data = buffer.getChannelData(0);
  const size = Math.max(1, Math.floor(data.length / columns));
  const peaks: [number, number][] = [];
  for (let c = 0; c < columns; c++) {
    let min = 0;
    let max = 0;
    const end = Math.min(data.length, (c + 1) * size);
    for (let i = c * size; i < end; i += 4) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }
    peaks.push([min, max]);
  }
  return peaks;
}

export function formatDuration(seconds: number, precise = false) {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${precise ? s.toFixed(1).padStart(4, "0") : String(Math.floor(s)).padStart(2, "0")}`;
}
