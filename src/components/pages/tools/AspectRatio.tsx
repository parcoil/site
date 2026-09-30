"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { NumberField } from "@/components/tools/fields";
import { formatNumber } from "@/lib/units";

const PRESETS: [number, number, string][] = [
  [16, 9, "HD video, monitors"],
  [9, 16, "Stories, Reels, TikTok"],
  [4, 3, "Classic TV, iPad"],
  [21, 9, "Ultrawide"],
  [1, 1, "Square posts"],
  [4, 5, "Instagram portrait"],
  [3, 2, "35mm photos"],
];

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

function simplify(w: number, h: number) {
  if (!(w > 0 && h > 0)) return null;
  if (Number.isInteger(w) && Number.isInteger(h)) {
    const d = gcd(w, h);
    return [w / d, h / d];
  }
  return [Number((w / h).toFixed(3)), 1];
}

export default function AspectRatio() {
  const [ratioW, setRatioW] = useState("16");
  const [ratioH, setRatioH] = useState("9");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [findW, setFindW] = useState("2560");
  const [findH, setFindH] = useState("1080");

  const ratio = Number(ratioW) / Number(ratioH);
  const valid = Number.isFinite(ratio) && ratio > 0;

  const onWidth = (v: string) => {
    setWidth(v);
    if (valid && Number(v) > 0) setHeight(formatNumber(Math.round((Number(v) / ratio) * 100) / 100));
  };
  const onHeight = (v: string) => {
    setHeight(v);
    if (valid && Number(v) > 0) setWidth(formatNumber(Math.round(Number(v) * ratio * 100) / 100));
  };
  const setRatio = (w: number, h: number) => {
    setRatioW(String(w));
    setRatioH(String(h));
    if (Number(width) > 0) setHeight(formatNumber(Math.round((Number(width) * h) / w)));
  };

  const found = simplify(Number(findW), Number(findH));
  const preview = valid ? { width: ratio >= 1 ? 160 : 160 * ratio, height: ratio >= 1 ? 160 / ratio : 160 } : null;

  return (
    <ToolCard className="max-w-3xl">
      <section className="space-y-4">
        <h2 className="font-medium">Resize keeping an aspect ratio</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(([w, h, note]) => (
            <Button key={`${w}:${h}`} size="sm" variant={ratioW === String(w) && ratioH === String(h) ? "default" : "outline"} onClick={() => setRatio(w, h)} title={note}>
              {w}:{h}
            </Button>
          ))}
        </div>
        <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Ratio width" value={ratioW} onChange={setRatioW} min={0} />
            <NumberField label="Ratio height" value={ratioH} onChange={setRatioH} min={0} />
            <NumberField label="Width" value={width} onChange={onWidth} suffix="px" min={0} />
            <NumberField label="Height" value={height} onChange={onHeight} suffix="px" min={0} />
          </div>
          {preview && (
            <div className="flex h-44 w-44 items-center justify-center justify-self-center">
              <div
                className="flex items-center justify-center rounded-md border-2 border-primary bg-primary/10 text-sm font-medium"
                style={{ width: preview.width, height: preview.height }}
              >
                {ratioW}:{ratioH}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="font-medium">Find the aspect ratio of a size</h2>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Width" value={findW} onChange={setFindW} suffix="px" min={0} />
          <NumberField label="Height" value={findH} onChange={setFindH} suffix="px" min={0} />
        </div>
        {found && (
          <p className="text-lg">
            Aspect ratio: <strong className="text-2xl text-primary">{found[0]}:{found[1]}</strong>{" "}
            <span className="text-muted-foreground">({formatNumber(Number(findW) / Number(findH), 4)}:1)</span>
          </p>
        )}
      </section>
    </ToolCard>
  );
}
