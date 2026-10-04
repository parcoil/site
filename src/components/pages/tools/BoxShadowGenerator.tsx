"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColorInput from "@/components/tools/ColorInput";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { SliderField, SwitchField } from "@/components/tools/fields";
import { hexToRgb } from "@/lib/color";

type Shadow = { x: number; y: number; blur: number; spread: number; color: string; opacity: number; inset: boolean };

const layer = (x: number, y: number, blur: number, spread: number, opacity: number, color = "#000000", inset = false): Shadow => ({
  x, y, blur, spread, color, opacity, inset,
});

const PRESETS: { name: string; box: string; background: string; shadows: Shadow[] }[] = [
  { name: "Soft", box: "#ffffff", background: "#f1f5f9", shadows: [layer(0, 10, 30, -5, 15), layer(0, 4, 6, -4, 10)] },
  { name: "Elevated", box: "#ffffff", background: "#f1f5f9", shadows: [layer(0, 25, 50, -12, 25)] },
  { name: "Hard", box: "#fde047", background: "#ffffff", shadows: [layer(6, 6, 0, 0, 100)] },
  { name: "Glow", box: "#7c3aed", background: "#0f172a", shadows: [layer(0, 0, 40, 5, 60, "#a855f7")] },
  { name: "Neumorphic", box: "#e0e5ec", background: "#e0e5ec", shadows: [layer(9, 9, 16, 0, 25, "#a3b1c6"), layer(-9, -9, 16, 0, 100, "#ffffff")] },
  { name: "Inset", box: "#f1f5f9", background: "#ffffff", shadows: [layer(0, 2, 8, 0, 25, "#000000", true)] },
];

function toCss(s: Shadow) {
  const { r, g, b } = hexToRgb(s.color)!;
  const color = s.opacity === 100 ? s.color : `rgba(${r}, ${g}, ${b}, ${s.opacity / 100})`;
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}`;
}

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<Shadow[]>(PRESETS[0].shadows);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState(PRESETS[0].box);
  const [background, setBackground] = useState(PRESETS[0].background);
  const [radius, setRadius] = useState(16);

  const current = shadows[Math.min(active, shadows.length - 1)];
  const css = shadows.map(toCss).join(",\n    ");
  const update = (patch: Partial<Shadow>) =>
    setShadows((all) => all.map((s, i) => (i === active ? { ...s, ...patch } : s)));

  return (
    <ToolCard>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="flex h-72 items-center justify-center rounded-lg border sm:h-96" style={{ backgroundColor: background }}>
            <div
              className="h-36 w-36 sm:h-44 sm:w-44"
              style={{ backgroundColor: box, borderRadius: radius, boxShadow: shadows.map(toCss).join(", ") }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setShadows(p.shadows);
                  setBox(p.box);
                  setBackground(p.background);
                  setActive(0);
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {shadows.map((_, i) => (
              <Button key={i} size="sm" variant={i === active ? "default" : "outline"} onClick={() => setActive(i)}>
                Layer {i + 1}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShadows([...shadows, layer(0, 4, 12, 0, 20)]);
                setActive(shadows.length);
              }}
              disabled={shadows.length >= 6}
              aria-label="Add layer"
            >
              <Plus />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShadows(shadows.filter((_, i) => i !== active));
                setActive(0);
              }}
              disabled={shadows.length <= 1}
              aria-label="Delete layer"
            >
              <Trash2 />
            </Button>
          </div>

          <SliderField label="Horizontal offset" value={current.x} onChange={(x) => update({ x })} min={-100} max={100} format={(v) => `${v}px`} />
          <SliderField label="Vertical offset" value={current.y} onChange={(y) => update({ y })} min={-100} max={100} format={(v) => `${v}px`} />
          <SliderField label="Blur" value={current.blur} onChange={(blur) => update({ blur })} min={0} max={150} format={(v) => `${v}px`} />
          <SliderField label="Spread" value={current.spread} onChange={(spread) => update({ spread })} min={-50} max={50} format={(v) => `${v}px`} />
          <SliderField label="Opacity" value={current.opacity} onChange={(opacity) => update({ opacity })} min={0} max={100} format={(v) => `${v}%`} />
          <ColorInput label="Shadow color" value={current.color} onChange={(color) => update({ color })} />
          <SwitchField label="Inset" checked={current.inset} onChange={(inset) => update({ inset })} />

          <div className="grid grid-cols-2 gap-3 border-t pt-4">
            <ColorInput label="Box" value={box} onChange={setBox} />
            <ColorInput label="Background" value={background} onChange={setBackground} />
          </div>
          <SliderField label="Border radius" value={radius} onChange={setRadius} min={0} max={100} format={(v) => `${v}px`} />
        </div>
      </div>

      <OutputField multiline mono label="CSS" value={`box-shadow: ${css};`} inputClassName="min-h-24" />
    </ToolCard>
  );
}
