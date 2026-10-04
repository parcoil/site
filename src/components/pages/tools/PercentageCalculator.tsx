"use client";
import { useState, type ReactNode } from "react";
import ToolCard from "@/components/tools/ToolCard";
import { formatNumber } from "@/lib/units";

function Blank({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mx-1 h-9 w-28 rounded-md border border-input bg-transparent px-2 text-center shadow-xs outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

function Calculation({ title, children, result }: { title: string; children: ReactNode; result: ReactNode }) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap items-center gap-y-2 text-base">{children}</div>
      <p className="text-xl font-semibold text-primary">{result}</p>
    </div>
  );
}

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
const show = (n: number, suffix = "") => (Number.isFinite(n) ? `${formatNumber(n, 8)}${suffix}` : "—");

export default function PercentageCalculator() {
  const [a, setA] = useState({ pct: "20", of: "150" });
  const [b, setB] = useState({ part: "30", whole: "120" });
  const [c, setC] = useState({ from: "80", to: "100" });
  const [d, setD] = useState({ value: "250", pct: "15" });
  const [e, setE] = useState({ price: "59.99", off: "25" });

  const change = ((num(c.to) - num(c.from)) / Math.abs(num(c.from))) * 100;
  const salePrice = num(e.price) * (1 - num(e.off) / 100);

  return (
    <ToolCard className="max-w-3xl">
      <Calculation title="Percentage of a number" result={show((num(a.pct) / 100) * num(a.of))}>
        What is <Blank label="Percent" value={a.pct} onChange={(pct) => setA({ ...a, pct })} /> % of
        <Blank label="Number" value={a.of} onChange={(of) => setA({ ...a, of })} />?
      </Calculation>

      <Calculation title="What percent one number is of another" result={show((num(b.part) / num(b.whole)) * 100, "%")}>
        <Blank label="Part" value={b.part} onChange={(part) => setB({ ...b, part })} /> is what percent of
        <Blank label="Whole" value={b.whole} onChange={(whole) => setB({ ...b, whole })} />?
      </Calculation>

      <Calculation
        title="Percentage increase or decrease"
        result={Number.isFinite(change) ? `${change >= 0 ? "+" : ""}${show(change, "%")} ${change >= 0 ? "increase" : "decrease"}` : "—"}
      >
        From <Blank label="Original value" value={c.from} onChange={(from) => setC({ ...c, from })} /> to
        <Blank label="New value" value={c.to} onChange={(to) => setC({ ...c, to })} />
      </Calculation>

      <Calculation
        title="Add or subtract a percentage"
        result={
          <>
            +{d.pct || 0}%: {show(num(d.value) * (1 + num(d.pct) / 100))}
            <span className="mx-3 text-muted-foreground">·</span>
            −{d.pct || 0}%: {show(num(d.value) * (1 - num(d.pct) / 100))}
          </>
        }
      >
        <Blank label="Value" value={d.value} onChange={(value) => setD({ ...d, value })} /> plus or minus
        <Blank label="Percent" value={d.pct} onChange={(pct) => setD({ ...d, pct })} /> %
      </Calculation>

      <Calculation
        title="Discount / sale price"
        result={
          <>
            Sale price {show(salePrice)}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              (you save {show(num(e.price) - salePrice)})
            </span>
          </>
        }
      >
        Price <Blank label="Original price" value={e.price} onChange={(price) => setE({ ...e, price })} /> with
        <Blank label="Discount percent" value={e.off} onChange={(off) => setE({ ...e, off })} /> % off
      </Calculation>
    </ToolCard>
  );
}
