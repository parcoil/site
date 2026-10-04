"use client";
import { useState } from "react";
import { ArrowUpDown, CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import ColorInput from "@/components/tools/ColorInput";
import ToolCard from "@/components/tools/ToolCard";
import { type RGB, contrastRatio, hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "@/lib/color";
import { cn } from "@/lib/utils";

const CHECKS = [
  { label: "Normal text", level: "AA", min: 4.5 },
  { label: "Normal text", level: "AAA", min: 7 },
  { label: "Large text (18pt+ or 14pt bold)", level: "AA", min: 3 },
  { label: "Large text (18pt+ or 14pt bold)", level: "AAA", min: 4.5 },
  { label: "UI components & graphics", level: "AA", min: 3 },
];

/** Nudges the text color's lightness until it reaches the target ratio. */
function suggest(text: RGB, background: RGB, target: number) {
  const hsl = rgbToHsl(text);
  const candidates: RGB[] = [];
  for (const direction of [-1, 1]) {
    for (let l = hsl.l; l >= 0 && l <= 100; l += direction) {
      const rgb = hslToRgb({ ...hsl, l });
      if (contrastRatio(rgb, background) >= target) {
        candidates.push(rgb);
        break;
      }
    }
  }
  // Prefer the option closest to the original color.
  return candidates.sort((a, b) => Math.abs(rgbToHsl(a).l - hsl.l) - Math.abs(rgbToHsl(b).l - hsl.l))[0];
}

export default function ContrastChecker() {
  const [foreground, setForeground] = useState("#7c3aed");
  const [background, setBackground] = useState("#ffffff");
  const fg = hexToRgb(foreground)!;
  const bg = hexToRgb(background)!;
  const ratio = contrastRatio(fg, bg);
  const fixAA = ratio < 4.5 ? suggest(fg, bg, 4.5) : null;
  const fixAAA = ratio < 7 ? suggest(fg, bg, 7) : null;

  return (
    <ToolCard className="max-w-3xl">
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <ColorInput label="Text color" value={foreground} onChange={setForeground} />
        <Button
          variant="outline"
          size="icon"
          className="justify-self-center"
          aria-label="Swap colors"
          onClick={() => {
            setForeground(background);
            setBackground(foreground);
          }}
        >
          <ArrowUpDown className="sm:rotate-90" />
        </Button>
        <ColorInput label="Background color" value={background} onChange={setBackground} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-3" style={{ backgroundColor: background, color: foreground }}>
          <p className="text-3xl font-bold">Large heading</p>
          <p>
            This is normal body text. The quick brown fox jumps over the lazy dog. Readable text
            needs enough contrast against its background.
          </p>
          <span className="inline-block rounded-md border-2 px-3 py-1 text-sm font-medium" style={{ borderColor: foreground }}>
            Button
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-center">
            <span className="text-5xl font-bold tabular-nums">{ratio.toFixed(2)}</span>
            <span className="text-2xl text-muted-foreground">:1</span>
          </p>
          <ul className="space-y-1.5">
            {CHECKS.map((check) => {
              const pass = ratio >= check.min;
              return (
                <li key={check.label + check.level} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {check.label} <span className="text-muted-foreground">({check.level}, {check.min}:1)</span>
                  </span>
                  <span className={cn("flex items-center gap-1 font-medium", pass ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                    {pass ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
                    {pass ? "Pass" : "Fail"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {(fixAA || fixAAA) && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Suggested text colors</p>
          <div className="flex flex-wrap gap-2">
            {[
              { rgb: fixAA, label: "Passes AA" },
              { rgb: fixAAA, label: "Passes AAA" },
            ].map(({ rgb, label }) =>
              rgb ? (
                <Button key={label} variant="outline" onClick={() => setForeground(rgbToHex(rgb))}>
                  <span className="h-4 w-4 rounded-sm border" style={{ backgroundColor: rgbToHex(rgb) }} />
                  {rgbToHex(rgb).toUpperCase()} · {label}
                </Button>
              ) : null,
            )}
          </div>
        </div>
      )}
    </ToolCard>
  );
}
