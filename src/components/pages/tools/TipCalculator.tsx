"use client";
import { useState } from "react";
import ToolCard from "@/components/tools/ToolCard";
import { Field, NumberField, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { Stat, StatGrid } from "@/components/tools/stats";

const PRESETS = ["10", "15", "18", "20", "25"] as const;
const money = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

export default function TipCalculator() {
  const [bill, setBill] = useState("64.50");
  const [tip, setTip] = useState(18);
  const [people, setPeople] = useState(2);
  const [roundUp, setRoundUp] = useState(false);

  const amount = Number(bill) || 0;
  const tipAmount = (amount * tip) / 100;
  let perPerson = (amount + tipAmount) / people;
  if (roundUp) perPerson = Math.ceil(perPerson);
  const total = perPerson * people;
  const actualTip = total - amount;

  return (
    <ToolCard className="max-w-2xl">
      <NumberField label="Bill amount" value={bill} onChange={setBill} min={0} step={0.01} />

      <Field label="Tip">
        <OptionPicker
          value={String(tip)}
          onChange={(v) => setTip(Number(v))}
          options={PRESETS.map((p) => ({ value: p as string, label: `${p}%` }))}
        />
      </Field>
      <SliderField label="Custom tip" value={tip} onChange={setTip} min={0} max={50} format={(v) => `${v}%`} />
      <SliderField label="Split between" value={people} onChange={setPeople} min={1} max={20} format={(v) => `${v} ${v === 1 ? "person" : "people"}`} />
      <SwitchField
        label="Round up each person's share"
        description="Rounds up to a whole amount so nobody has to deal with change."
        checked={roundUp}
        onChange={setRoundUp}
      />

      <StatGrid>
        <Stat label="Tip" value={money(actualTip)} />
        <Stat label="Total" value={money(total)} />
        <Stat label="Tip per person" value={money(actualTip / people)} />
        <Stat label="Each person pays" value={money(perPerson)} className="border-primary bg-primary/10" />
      </StatGrid>
    </ToolCard>
  );
}
