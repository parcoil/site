"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField } from "@/components/tools/fields";

type Wave = OscillatorType;
const SWEEP_SECONDS = 12;

/** Slider position (0–1000) ↔ frequency on a log scale from 20 Hz to 20 kHz. */
const toFrequency = (position: number) => Math.round(20 * 1000 ** (position / 1000));
const toPosition = (frequency: number) => Math.round((Math.log(frequency / 20) / Math.log(1000)) * 1000);

export default function SpeakerTest() {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const tone = useRef<OscillatorNode | null>(null);
  const [volume, setVolume] = useState(30);
  const [frequency, setFrequency] = useState(440);
  const [wave, setWave] = useState<Wave>("sine");
  const [playing, setPlaying] = useState<"tone" | "sweep" | null>(null);
  const [channel, setChannel] = useState<string | null>(null);

  const audio = () => {
    if (!context.current) {
      context.current = new AudioContext();
      master.current = context.current.createGain();
      master.current.connect(context.current.destination);
    }
    master.current!.gain.value = volume / 100;
    return context.current;
  };

  useEffect(() => {
    if (master.current) master.current.gain.value = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (tone.current && playing === "tone") {
      tone.current.frequency.setTargetAtTime(frequency, context.current!.currentTime, 0.02);
      tone.current.type = wave;
    }
  }, [frequency, wave, playing]);

  useEffect(() => () => void context.current?.close(), []);

  const stopTone = () => {
    tone.current?.stop();
    tone.current = null;
    setPlaying(null);
  };

  /** A short three-note chime panned to one side. */
  const chime = (pan: number, name: string) => {
    const ctx = audio();
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(master.current!);
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.18;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.6, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain).connect(panner);
      osc.start(t);
      osc.stop(t + 0.6);
    });
    setChannel(name);
    setTimeout(() => setChannel(null), 900);
  };

  const startTone = (mode: "tone" | "sweep") => {
    stopTone();
    const ctx = audio();
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.connect(master.current!);
    if (mode === "sweep") {
      osc.frequency.setValueAtTime(20, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20000, ctx.currentTime + SWEEP_SECONDS);
      osc.stop(ctx.currentTime + SWEEP_SECONDS);
      const startedAt = ctx.currentTime;
      const tick = setInterval(() => {
        const t = (ctx.currentTime - startedAt) / SWEEP_SECONDS;
        if (t >= 1 || tone.current !== osc) return clearInterval(tick);
        setFrequency(Math.round(20 * 1000 ** t));
      }, 50);
      osc.onended = () => tone.current === osc && stopTone();
    } else {
      osc.frequency.value = frequency;
    }
    osc.start();
    tone.current = osc;
    setPlaying(mode);
  };

  return (
    <ToolCard className="max-w-3xl">
      <SliderField label={<span className="flex items-center gap-2"><Volume2 className="h-4 w-4" /> Volume (start low!)</span>} value={volume} onChange={setVolume} min={0} max={100} format={(v) => `${v}%`} />

      <section className="space-y-3">
        <h2 className="font-medium">Left / right channel test</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { pan: -1, name: "Left" },
            { pan: 0, name: "Both" },
            { pan: 1, name: "Right" },
          ].map(({ pan, name }) => (
            <Button key={name} size="lg" variant={channel === name ? "default" : "outline"} className="h-20 text-base" onClick={() => chime(pan, name)}>
              {name === "Left" ? "◀ " : ""}
              {name}
              {name === "Right" ? " ▶" : ""}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="font-medium">Tone generator &amp; frequency sweep</h2>
        <p className="text-center font-mono text-4xl font-bold tabular-nums">
          {frequency.toLocaleString()} <span className="text-xl text-muted-foreground">Hz</span>
        </p>
        <SliderField
          label="Frequency"
          value={toPosition(frequency)}
          onChange={(p) => setFrequency(toFrequency(p))}
          min={0}
          max={1000}
          format={() => ""}
        />
        <Field label="Waveform">
          <OptionPicker
            value={wave}
            onChange={setWave}
            options={[
              { value: "sine", label: "Sine" },
              { value: "square", label: "Square" },
              { value: "sawtooth", label: "Sawtooth" },
              { value: "triangle", label: "Triangle" },
            ]}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          {playing ? (
            <Button variant="destructive" onClick={stopTone}>
              <Square /> Stop
            </Button>
          ) : (
            <>
              <Button onClick={() => startTone("tone")}>
                <Play /> Play tone
              </Button>
              <Button variant="outline" onClick={() => startTone("sweep")}>
                <Play /> Sweep 20 Hz → 20 kHz
              </Button>
            </>
          )}
        </div>
      </section>
    </ToolCard>
  );
}
