"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolCard from "@/components/tools/ToolCard";
import { OptionPicker } from "@/components/tools/fields";
import { UNIT_CATEGORIES, convertUnit, formatNumber, type Unit } from "@/lib/units";

function UnitSide({
  units,
  unitId,
  onUnitChange,
  value,
  onValueChange,
  label,
}: {
  units: Unit[];
  unitId: string;
  onUnitChange: (id: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex-1 space-y-2">
      <Input
        type="number"
        inputMode="decimal"
        aria-label={`${label} value`}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-12 text-lg"
      />
      <Select value={unitId} onValueChange={onUnitChange}>
        <SelectTrigger aria-label={`${label} unit`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function UnitConverter() {
  const [categoryId, setCategoryId] = useState(UNIT_CATEGORIES[0].id);
  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId)!;
  const [fromId, setFromId] = useState(category.defaults[0]);
  const [toId, setToId] = useState(category.defaults[1]);
  // The side the user last typed in is the source of truth.
  const [value, setValue] = useState("1");
  const [editing, setEditing] = useState<"from" | "to">("from");

  const unit = (id: string) => category.units.find((u) => u.id === id) ?? category.units[0];
  const from = unit(fromId);
  const to = unit(toId);
  const number = parseFloat(value);
  const valid = value.trim() !== "" && Number.isFinite(number);

  const fromValue =
    editing === "from" ? value : valid ? formatNumber(convertUnit(number, to, from)) : "";
  const toValue =
    editing === "to" ? value : valid ? formatNumber(convertUnit(number, from, to)) : "";
  const baseValue = parseFloat(fromValue);

  const selectCategory = (id: string) => {
    const next = UNIT_CATEGORIES.find((c) => c.id === id)!;
    setCategoryId(id);
    setFromId(next.defaults[0]);
    setToId(next.defaults[1]);
    setValue("1");
    setEditing("from");
  };

  return (
    <ToolCard className="max-w-3xl">
      <OptionPicker
        aria-label="Category"
        value={categoryId}
        onChange={selectCategory}
        options={UNIT_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
        <UnitSide
          label="From"
          units={category.units}
          unitId={from.id}
          onUnitChange={setFromId}
          value={fromValue}
          onValueChange={(v) => {
            setValue(v);
            setEditing("from");
          }}
        />
        <Button
          variant="outline"
          size="icon"
          className="self-center sm:mt-1.5"
          aria-label="Swap units"
          onClick={() => {
            setFromId(to.id);
            setToId(from.id);
          }}
        >
          <ArrowLeftRight />
        </Button>
        <UnitSide
          label="To"
          units={category.units}
          unitId={to.id}
          onUnitChange={setToId}
          value={toValue}
          onValueChange={(v) => {
            setValue(v);
            setEditing("to");
          }}
        />
      </div>

      {Number.isFinite(baseValue) && (
        <p className="text-center text-lg">
          <strong>{fromValue}</strong> {from.label.replace(/ \(.*\)$/, "").toLowerCase()} ={" "}
          <strong>{toValue}</strong> {to.label.replace(/ \(.*\)$/, "").toLowerCase()}
        </p>
      )}

      {Number.isFinite(baseValue) && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">
            {fromValue} {from.label} in every unit
          </h2>
          <div className="divide-y rounded-lg border">
            {category.units
              .filter((u) => u.id !== from.id)
              .map((u) => (
                <div key={u.id} className="flex justify-between gap-4 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-mono">{formatNumber(convertUnit(baseValue, from, u))}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </ToolCard>
  );
}
