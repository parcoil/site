"use client";
import { useState } from "react";
import ToolCard from "@/components/tools/ToolCard";
import { NumberField, OptionPicker } from "@/components/tools/fields";
import { Stat, StatGrid } from "@/components/tools/stats";

const CATEGORIES = [
  { max: 18.5, label: "Underweight", color: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  { max: 25, label: "Healthy weight", color: "bg-green-500", text: "text-green-600 dark:text-green-400" },
  { max: 30, label: "Overweight", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { max: Infinity, label: "Obese", color: "bg-red-500", text: "text-red-600 dark:text-red-400" },
];
const SCALE_MIN = 15;
const SCALE_MAX = 40;

export default function BmiCalculator() {
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("70");
  const [ft, setFt] = useState("5");
  const [inches, setInches] = useState("9");
  const [lb, setLb] = useState("155");

  const meters = units === "metric" ? Number(cm) / 100 : (Number(ft) * 12 + Number(inches || 0)) * 0.0254;
  const kilograms = units === "metric" ? Number(kg) : Number(lb) * 0.45359237;
  const bmi = meters > 0 && kilograms > 0 ? kilograms / meters ** 2 : NaN;
  const category = CATEGORIES.find((c) => bmi < c.max);
  const healthy = [18.5 * meters ** 2, 24.9 * meters ** 2];
  const toDisplay = (kgValue: number) =>
    units === "metric" ? `${kgValue.toFixed(1)} kg` : `${(kgValue / 0.45359237).toFixed(0)} lb`;
  const marker = Math.min(100, Math.max(0, ((bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

  return (
    <ToolCard className="max-w-2xl">
      <OptionPicker
        value={units}
        onChange={setUnits}
        options={[
          { value: "metric", label: "Metric (cm, kg)" },
          { value: "imperial", label: "Imperial (ft, lb)" },
        ]}
      />

      {units === "metric" ? (
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Height" value={cm} onChange={setCm} suffix="cm" min={0} />
          <NumberField label="Weight" value={kg} onChange={setKg} suffix="kg" min={0} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="Height (feet)" value={ft} onChange={setFt} suffix="ft" min={0} />
          <NumberField label="Height (inches)" value={inches} onChange={setInches} suffix="in" min={0} />
          <NumberField label="Weight" value={lb} onChange={setLb} suffix="lb" min={0} />
        </div>
      )}

      {Number.isFinite(bmi) && category && (
        <>
          <div className="text-center">
            <p className="text-6xl font-bold tabular-nums">{bmi.toFixed(1)}</p>
            <p className={`text-lg font-semibold ${category.text}`}>{category.label}</p>
          </div>

          <div className="space-y-1">
            <div className="relative flex h-3 overflow-hidden rounded-full">
              {CATEGORIES.map((c, i) => {
                const from = i === 0 ? SCALE_MIN : CATEGORIES[i - 1].max;
                const to = Math.min(c.max, SCALE_MAX);
                return <div key={c.label} className={c.color} style={{ width: `${((to - from) / (SCALE_MAX - SCALE_MIN)) * 100}%` }} />;
              })}
            </div>
            <div className="relative h-4">
              <div className="absolute -top-1 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-8 border-x-transparent border-b-foreground" style={{ left: `${marker}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          <StatGrid className="md:grid-cols-2">
            <Stat label="Healthy weight for your height" value={`${toDisplay(healthy[0])} – ${toDisplay(healthy[1])}`} />
            <Stat
              label={kilograms > healthy[1] ? "To reach a healthy BMI" : kilograms < healthy[0] ? "To reach a healthy BMI" : "You're in the healthy range"}
              value={
                kilograms > healthy[1]
                  ? `Lose ${toDisplay(kilograms - healthy[1])}`
                  : kilograms < healthy[0]
                    ? `Gain ${toDisplay(healthy[0] - kilograms)}`
                    : "✓"
              }
             
            />
          </StatGrid>
        </>
      )}
    </ToolCard>
  );
}
