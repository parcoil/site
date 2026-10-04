"use client";
import { useState } from "react";
import { Plus, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ColorInput from "@/components/tools/ColorInput";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField } from "@/components/tools/fields";
import { hslToRgb, rgbToHex } from "@/lib/color";
import { randomBetween } from "@/lib/random";

type Stop = { id: number; color: string; position: number };
type Kind = "linear" | "radial" | "conic";

let nextId = 10;

const PRESETS: { name: string; angle: number; stops: [string, number][] }[] = [
  { name: "Sunset", angle: 135, stops: [["#ff7e5f", 0], ["#feb47b", 100]] },
  { name: "Ocean", angle: 90, stops: [["#2193b0", 0], ["#6dd5ed", 100]] },
  { name: "Grape", angle: 135, stops: [["#7c3aed", 0], ["#db2777", 100]] },
  { name: "Aurora", angle: 120, stops: [["#00c9ff", 0], ["#92fe9d", 100]] },
  { name: "Fire", angle: 45, stops: [["#f12711", 0], ["#f5af19", 100]] },
  { name: "Night", angle: 180, stops: [["#0f2027", 0], ["#203a43", 50], ["#2c5364", 100]] },
];

export default function GradientGenerator() {
  const [kind, setKind] = useState<Kind>("linear");
  const [angle, setAngle] = useState(135);
  const [shape, setShape] = useState<"circle" | "ellipse">("circle");
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, color: "#7c3aed", position: 0 },
    { id: 2, color: "#db2777", position: 100 },
  ]);

  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const list = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
  const gradient =
    kind === "linear"
      ? `linear-gradient(${angle}deg, ${list})`
      : kind === "radial"
        ? `radial-gradient(${shape}, ${list})`
        : `conic-gradient(from ${angle}deg, ${list})`;

  const update = (id: number, patch: Partial<Stop>) =>
    setStops((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addStop = () => {
    // Put the new stop in the widest gap.
    let best = { at: 50, gap: 0 };
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > best.gap) best = { at: Math.round(sorted[i].position + gap / 2), gap };
    }
    setStops([...stops, { id: nextId++, color: "#ffffff", position: best.at }]);
  };

  const randomize = () => {
    const hue = randomBetween(0, 359);
    setAngle(randomBetween(0, 12) * 30);
    setStops([
      { id: nextId++, color: rgbToHex(hslToRgb({ h: hue, s: 80, l: 55 })), position: 0 },
      { id: nextId++, color: rgbToHex(hslToRgb({ h: (hue + randomBetween(40, 160)) % 360, s: 80, l: 55 })), position: 100 },
    ]);
  };

  return (
    <ToolCard>
      <div className="h-56 w-full rounded-lg border sm:h-72" style={{ background: gradient }} />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            title={p.name}
            aria-label={`${p.name} preset`}
            className="h-9 w-16 rounded-md border transition-transform hover:scale-105"
            style={{ background: `linear-gradient(${p.angle}deg, ${p.stops.map(([c, pos]) => `${c} ${pos}%`).join(", ")})` }}
            onClick={() => {
              setAngle(p.angle);
              setStops(p.stops.map(([color, position]) => ({ id: nextId++, color, position })));
            }}
          />
        ))}
        <Button variant="outline" size="sm" className="h-9" onClick={randomize}>
          <Shuffle /> Random
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type">
          <OptionPicker
            value={kind}
            onChange={setKind}
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
              { value: "conic", label: "Conic" },
            ]}
          />
        </Field>
        {kind === "radial" ? (
          <Field label="Shape">
            <OptionPicker
              value={shape}
              onChange={setShape}
              options={[
                { value: "circle", label: "Circle" },
                { value: "ellipse", label: "Ellipse" },
              ]}
            />
          </Field>
        ) : (
          <SliderField label="Angle" value={angle} onChange={setAngle} min={0} max={360} format={(v) => `${v}°`} />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Color stops</p>
          <Button variant="outline" size="sm" onClick={addStop} disabled={stops.length >= 8}>
            <Plus /> Add stop
          </Button>
        </div>
        {stops.map((stop) => (
          <div key={stop.id} className="grid grid-cols-[minmax(0,12rem)_1fr_auto_auto] items-center gap-3">
            <ColorInput value={stop.color} onChange={(color) => update(stop.id, { color })} />
            <Slider aria-label="Position" value={[stop.position]} onValueChange={([position]) => update(stop.id, { position })} min={0} max={100} />
            <span className="w-10 text-right text-sm tabular-nums">{stop.position}%</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove stop"
              disabled={stops.length <= 2}
              onClick={() => setStops(stops.filter((s) => s.id !== stop.id))}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>

      <OutputField mono label="CSS" value={`background: ${gradient};`} />
    </ToolCard>
  );
}
