"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextTransformer from "@/components/tools/TextTransformer";
import { SliderField } from "@/components/tools/fields";

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", _: "..--.-", '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const encode = (text: string) =>
  text
    .toUpperCase()
    .trim()
    .split(/\s+/)
    .map((word) => Array.from(word, (c) => MORSE[c]).filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" / ");

function decode(code: string) {
  const normalized = code.replace(/[·•]/g, ".").replace(/[−–—_]/g, "-");
  if (/[^.\-\s/|]/.test(normalized)) {
    throw new Error("Morse code can only contain dots, dashes, spaces and / between words.");
  }
  return normalized
    .trim()
    .split(/\s*[/|]\s*|\s{3,}/)
    .map((word) =>
      word
        .split(/\s+/)
        .filter(Boolean)
        .map((letter) => FROM_MORSE[letter] ?? "?")
        .join(""),
    )
    .join(" ");
}

/** Schedules the whole message on one oscillator; returns a stop function. */
function playMorse(code: string, wpm: number, onEnd: () => void) {
  const ctx = new AudioContext();
  const unit = 1.2 / wpm;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 650;
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);

  let t = ctx.currentTime + 0.05;
  for (const symbol of code) {
    if (symbol === "." || symbol === "-") {
      const length = symbol === "." ? unit : unit * 3;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.005);
      gain.gain.setValueAtTime(0.4, t + length - 0.005);
      gain.gain.linearRampToValueAtTime(0, t + length);
      t += length + unit;
    } else {
      // A space adds up to the 3-unit letter gap; " / " adds up to the 7-unit word gap.
      t += unit * 2;
    }
  }
  osc.start();
  osc.stop(t);
  osc.onended = () => {
    ctx.close();
    onEnd();
  };
  return () => {
    osc.onended = null;
    ctx.close();
    onEnd();
  };
}

function MorsePlayer({ code }: { code: string }) {
  const [wpm, setWpm] = useState(18);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const toggle = () => {
    if (playing) {
      stopRef.current?.();
      return;
    }
    setPlaying(true);
    stopRef.current = playMorse(code, wpm, () => {
      stopRef.current = null;
      setPlaying(false);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <Button onClick={toggle} disabled={!code.trim()} className="sm:w-40">
        {playing ? <Square /> : <Play />}
        {playing ? "Stop" : "Play audio"}
      </Button>
      <SliderField
        className="flex-1 max-w-sm"
        label="Speed"
        value={wpm}
        onChange={setWpm}
        min={5}
        max={40}
        format={(v) => `${v} WPM`}
      />
    </div>
  );
}

export default function MorseCode() {
  return (
    <TextTransformer
      mono
      inputPlaceholder="SOS"
      modes={[
        { value: "encode", label: "Text → Morse", run: encode },
        { value: "decode", label: "Morse → Text", run: decode },
      ]}
      footer={({ input, output, mode }) => <MorsePlayer code={mode === "encode" ? output : input} />}
    />
  );
}
