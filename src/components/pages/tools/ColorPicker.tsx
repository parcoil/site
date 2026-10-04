"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SliderField } from "@/components/tools/fields";
import {
  type HSL,
  type RGB,
  formatCmyk,
  formatHsl,
  formatRgb,
  hslToRgb,
  parseColor,
  readableTextColor,
  rgbToHex,
  rgbToHsl,
} from "@/lib/color";
import { downloadText } from "@/lib/files";

type SavedColor = { hex: string; rgb: string; hsl: string };

const STORAGE_KEY = "savedColors";
const MAX_SAVED = 10;

function loadSavedColors(): SavedColor[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((c) => typeof c?.hex === "string" && c.hex.startsWith("#"))
      : [];
  } catch {
    return [];
  }
}

export default function ColorPicker() {
  const [rgb, setRgbState] = useState<RGB>({ r: 203, g: 166, b: 247 });
  // HSL is kept separately so hue survives when saturation hits 0.
  const [hsl, setHslState] = useState<HSL>(() => rgbToHsl({ r: 203, g: 166, b: 247 }));
  const [text, setText] = useState("#cba6f7");
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const pickerRef = useRef<HTMLInputElement>(null);
  const hex = rgbToHex(rgb);

  useEffect(() => setSavedColors(loadSavedColors()), []);

  const persist = (colors: SavedColor[]) => {
    setSavedColors(colors);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    } catch {
      toast.error("Failed to save colors to local storage");
    }
  };

  const setRgb = (next: RGB, updateText = true) => {
    setRgbState(next);
    setHslState(rgbToHsl(next));
    if (updateText) setText(rgbToHex(next));
  };

  const setHsl = (next: HSL) => {
    const nextRgb = hslToRgb(next);
    setHslState(next);
    setRgbState(nextRgb);
    setText(rgbToHex(nextRgb));
  };

  const saveColor = () => {
    if (savedColors.some((c) => c.hex === hex)) {
      toast.info("This color is already saved.");
      return;
    }
    if (savedColors.length >= MAX_SAVED) {
      toast.error(`You can save up to ${MAX_SAVED} colors. Please remove some first.`);
      return;
    }
    persist([...savedColors, { hex, rgb: formatRgb(rgb), hsl: formatHsl(hsl) }]);
    toast.success("Color saved!");
    posthog.capture("color_saved", { color: hex });
  };

  const exportPalette = () => {
    const css = `:root {\n${savedColors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n")}\n}\n`;
    downloadText(css, "color-palette.css", "text/css");
    toast.success("Palette exported as CSS variables!");
    posthog.capture("palette_exported", { colors_count: savedColors.length });
  };

  return (
    <ToolCard className="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
        <div className="relative">
          <button
            type="button"
            className="h-40 w-full rounded-lg border transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: hex, color: readableTextColor(rgb) }}
            onClick={() => pickerRef.current?.click()}
            aria-label="Open color picker"
          >
            <span className="font-mono text-lg font-semibold">{hex.toUpperCase()}</span>
          </button>
          <input
            ref={pickerRef}
            type="color"
            value={hex}
            onChange={(e) => setRgb(parseColor(e.target.value)!)}
            className="absolute bottom-0 left-1/2 h-0 w-0 opacity-0"
            tabIndex={-1}
            aria-hidden
          />
        </div>

        <div className="space-y-4">
          <Field
            label="Enter any color"
            htmlFor="color-text"
            hint="HEX, rgb(), hsl() or a CSS name like “tomato”"
          >
            <Input
              id="color-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                const parsed = parseColor(e.target.value);
                if (parsed) setRgb(parsed, false);
              }}
              className="font-mono"
            />
          </Field>
          <Button onClick={saveColor} className="w-full">
            <Plus /> Save Color
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <OutputField mono label="HEX" value={hex.toUpperCase()} />
        <OutputField mono label="RGB" value={formatRgb(rgb)} />
        <OutputField mono label="HSL" value={formatHsl(hsl)} />
        <OutputField mono label="CMYK" value={formatCmyk(rgb)} />
      </div>

      <Tabs defaultValue="rgb">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rgb">RGB sliders</TabsTrigger>
          <TabsTrigger value="hsl">HSL sliders</TabsTrigger>
        </TabsList>
        <TabsContent value="rgb" className="space-y-4 mt-4">
          {(["r", "g", "b"] as const).map((channel) => (
            <SliderField
              key={channel}
              label={{ r: "Red", g: "Green", b: "Blue" }[channel]}
              value={rgb[channel]}
              onChange={(v) => setRgb({ ...rgb, [channel]: v })}
              min={0}
              max={255}
            />
          ))}
        </TabsContent>
        <TabsContent value="hsl" className="space-y-4 mt-4">
          <SliderField label="Hue" value={hsl.h} onChange={(h) => setHsl({ ...hsl, h })} min={0} max={360} format={(v) => `${v}°`} />
          <SliderField label="Saturation" value={hsl.s} onChange={(s) => setHsl({ ...hsl, s })} min={0} max={100} format={(v) => `${v}%`} />
          <SliderField label="Lightness" value={hsl.l} onChange={(l) => setHsl({ ...hsl, l })} min={0} max={100} format={(v) => `${v}%`} />
        </TabsContent>
      </Tabs>

      {savedColors.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-medium">
            Saved Colors ({savedColors.length}/{MAX_SAVED})
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {savedColors.map((saved, index) => (
              <div key={saved.hex} className="relative group">
                <button
                  type="button"
                  className="w-full aspect-square rounded-md border"
                  style={{ backgroundColor: saved.hex }}
                  onClick={() => setRgb(parseColor(saved.hex)!)}
                  title={saved.hex}
                  aria-label={`Use ${saved.hex}`}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={() => persist(savedColors.filter((_, i) => i !== index))}
                  title="Remove color"
                  aria-label={`Remove ${saved.hex}`}
                >
                  <Trash className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={exportPalette} className="w-full">
            <Download /> Export as CSS Variables
          </Button>
        </div>
      )}
    </ToolCard>
  );
}
