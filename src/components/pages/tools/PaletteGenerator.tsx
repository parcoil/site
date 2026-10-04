"use client";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ColorInput from "@/components/tools/ColorInput";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker } from "@/components/tools/fields";
import { copyText } from "@/lib/clipboard";
import { type HSL, hexToRgb, hslToRgb, readableTextColor, rgbToHex, rgbToHsl } from "@/lib/color";
import { randomBetween } from "@/lib/random";

const HARMONIES: Record<string, { label: string; hues: number[] }> = {
  complementary: { label: "Complementary", hues: [0, 180] },
  analogous: { label: "Analogous", hues: [-30, 0, 30] },
  triadic: { label: "Triadic", hues: [0, 120, 240] },
  split: { label: "Split complementary", hues: [0, 150, 210] },
  tetradic: { label: "Tetradic", hues: [0, 90, 180, 270] },
};

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LIGHTER = [0.92, 0.8, 0.62, 0.42, 0.2];
const DARKER = [0.18, 0.36, 0.52, 0.68, 0.8];

/** Tailwind-style scale with the base color at 500. */
function shades(base: HSL) {
  return [
    ...LIGHTER.map((f) => ({ ...base, l: base.l + (98 - base.l) * f })),
    base,
    ...DARKER.map((f) => ({ ...base, l: base.l - (base.l - 6) * f })),
  ].map((hsl) => rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: Math.round(hsl.l) })));
}

function Swatch({ hex, caption, tall = false }: { hex: string; caption?: string; tall?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => copyText(hex.toUpperCase(), `Copied ${hex.toUpperCase()}`)}
      className={`flex flex-1 flex-col items-center justify-end gap-0.5 rounded-lg p-2 font-mono text-xs transition-transform hover:scale-105 ${tall ? "h-28" : "h-20"}`}
      style={{ backgroundColor: hex, color: readableTextColor(hexToRgb(hex)!) }}
      title="Click to copy"
    >
      {caption && <span className="opacity-80">{caption}</span>}
      <span className="font-semibold">{hex.toUpperCase()}</span>
    </button>
  );
}

export default function PaletteGenerator() {
  const [base, setBase] = useState("#7c3aed");
  const [harmony, setHarmony] = useState("triadic");
  const [name, setName] = useState("brand");
  const [format, setFormat] = useState<"css" | "tailwind" | "json">("css");

  const hsl = rgbToHsl(hexToRgb(base)!);
  const harmonyColors = HARMONIES[harmony].hues.map((offset) =>
    rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + offset + 360) % 360 })),
  );
  const scale = shades(hsl);
  const key = name.trim().replace(/\s+/g, "-").toLowerCase() || "brand";

  const exported =
    format === "css"
      ? `:root {\n${scale.map((hex, i) => `  --${key}-${STEPS[i]}: ${hex};`).join("\n")}\n}`
      : format === "tailwind"
        ? `// tailwind.config.js → theme.extend.colors\n${key}: {\n${scale.map((hex, i) => `  ${STEPS[i]}: "${hex}",`).join("\n")}\n},\n\n/* Tailwind v4: in your CSS */\n@theme {\n${scale.map((hex, i) => `  --color-${key}-${STEPS[i]}: ${hex};`).join("\n")}\n}`
        : JSON.stringify(Object.fromEntries(scale.map((hex, i) => [STEPS[i], hex])), null, 2);

  const randomize = () =>
    setBase(rgbToHex(hslToRgb({ h: randomBetween(0, 359), s: randomBetween(55, 90), l: randomBetween(40, 60) })));

  return (
    <ToolCard>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <ColorInput label="Base color" value={base} onChange={setBase} />
        <Field label="Palette name" htmlFor="palette-name">
          <Input id="palette-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Button variant="outline" onClick={randomize}>
          <Shuffle /> Random
        </Button>
      </div>

      <div className="space-y-3">
        <Field label="Color harmony">
          <OptionPicker
            value={harmony}
            onChange={setHarmony}
            options={Object.entries(HARMONIES).map(([value, h]) => ({ value, label: h.label }))}
          />
        </Field>
        <div className="flex gap-2">
          {harmonyColors.map((hex, i) => (
            <Swatch key={i} hex={hex} tall />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Shades &amp; tints</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:flex">
          {scale.map((hex, i) => (
            <Swatch key={STEPS[i]} hex={hex} caption={String(STEPS[i])} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <OptionPicker
          value={format}
          onChange={setFormat}
          options={[
            { value: "css", label: "CSS variables" },
            { value: "tailwind", label: "Tailwind" },
            { value: "json", label: "JSON" },
          ]}
        />
        <OutputField multiline mono label="Export" value={exported} inputClassName="min-h-56" />
      </div>
    </ToolCard>
  );
}
