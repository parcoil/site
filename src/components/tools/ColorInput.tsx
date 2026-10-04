"use client";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Field } from "@/components/tools/fields";
import { parseColor, rgbToHex } from "@/lib/color";
import { cn } from "@/lib/utils";

/** Color swatch picker plus a text box that accepts any CSS color. Value is a hex string. */
export default function ColorInput({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  /** Omit for a bare control (it's then labelled "Color" for screen readers). */
  label?: ReactNode;
  hint?: ReactNode;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}) {
  const id = useId();
  const [text, setText] = useState(value);

  // Follow outside changes (swaps, presets) unless the text already means this color.
  useEffect(() => {
    const parsed = parseColor(text);
    if (!parsed || rgbToHex(parsed) !== value.toLowerCase()) setText(value);
  }, [value]);

  const name = typeof label === "string" ? label : "Color";
  const control = (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-input pl-1 shadow-xs focus-within:ring-1 focus-within:ring-ring",
        !label && className,
      )}
    >
      <input
        type="color"
        aria-label={`${name} swatch`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <input
        id={id}
        aria-label={label ? undefined : name}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const parsed = parseColor(e.target.value);
          if (parsed) onChange(rgbToHex(parsed));
        }}
        spellCheck={false}
        className={cn(
          "h-9 w-full min-w-0 bg-transparent pr-3 font-mono text-sm outline-none",
          !parseColor(text) && "text-destructive",
        )}
      />
    </div>
  );

  if (!label) return control;
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      {control}
    </Field>
  );
}
