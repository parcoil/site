"use client";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { randomInt, seededRandom, shuffle } from "@/lib/random";

type Order = "none" | "az" | "za" | "numeric" | "length" | "reverse" | "shuffle";

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

type Options = {
  order: Order;
  dedupe: boolean;
  ignoreCase: boolean;
  trim: boolean;
  removeEmpty: boolean;
  number: boolean;
  seed: number;
};

function processLines(text: string, o: Options) {
  let lines = text.split(/\r?\n/);
  if (o.trim) lines = lines.map((l) => l.trim());
  if (o.removeEmpty) lines = lines.filter((l) => l.trim() !== "");
  if (o.dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      const key = o.ignoreCase ? l.toLowerCase() : l;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  switch (o.order) {
    case "az":
      lines.sort(collator.compare);
      break;
    case "za":
      lines.sort((a, b) => collator.compare(b, a));
      break;
    case "numeric":
      lines.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
      break;
    case "length":
      lines.sort((a, b) => a.length - b.length);
      break;
    case "reverse":
      lines.reverse();
      break;
    case "shuffle":
      lines = shuffle(lines, seededRandom(o.seed));
      break;
  }
  if (o.number) {
    const width = String(lines.length).length;
    lines = lines.map((l, i) => `${String(i + 1).padStart(width)}. ${l}`);
  }
  return lines.join("\n");
}

export default function LineTools() {
  const [order, setOrder] = useState<Order>("az");
  const [dedupe, setDedupe] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trim, setTrim] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [number, setNumber] = useState(false);
  const [seed, setSeed] = useState(1);

  const options = { order, dedupe, ignoreCase, trim, removeEmpty, number, seed };

  return (
    <TextTransformer
      inputLabel="Lines"
      inputPlaceholder={"banana\napple\ncherry\napple"}
      modes={[{ value: "apply", label: "Apply", run: (t) => processLines(t, options) }]}
      options={
        <div className="space-y-4">
          <Field label="Order">
            <div className="flex flex-wrap items-center gap-2">
              <OptionPicker
                value={order}
                onChange={setOrder}
                options={[
                  { value: "none", label: "Keep" },
                  { value: "az", label: "A → Z" },
                  { value: "za", label: "Z → A" },
                  { value: "numeric", label: "Numeric" },
                  { value: "length", label: "By length" },
                  { value: "reverse", label: "Reverse" },
                  { value: "shuffle", label: "Shuffle" },
                ]}
              />
              {order === "shuffle" && (
                <Button size="sm" variant="secondary" onClick={() => setSeed(randomInt(2 ** 31))}>
                  <Shuffle /> Reshuffle
                </Button>
              )}
            </div>
          </Field>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <SwitchField label="Remove duplicates" checked={dedupe} onChange={setDedupe} />
            <SwitchField label="Ignore case for duplicates" checked={ignoreCase} onChange={setIgnoreCase} />
            <SwitchField label="Trim whitespace" checked={trim} onChange={setTrim} />
            <SwitchField label="Remove empty lines" checked={removeEmpty} onChange={setRemoveEmpty} />
            <SwitchField label="Number lines" checked={number} onChange={setNumber} />
          </div>
        </div>
      }
    />
  );
}
