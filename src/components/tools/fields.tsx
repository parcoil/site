"use client";
import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** A label (with optional right-aligned extra) stacked above a control. */
export function Field({
  label,
  htmlFor,
  extra,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  extra?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2 min-h-5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {extra}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v) => String(v),
  className,
}: {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <Field
      label={label}
      htmlFor={id}
      className={className}
      extra={<span className="text-sm font-medium tabular-nums">{format(value)}</span>}
    >
      <Slider
        id={id}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </Field>
  );
}

export function SwitchField({
  label,
  description,
  checked,
  onChange,
  className,
}: {
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** Numeric input kept as a string so partially typed values like "1." survive. */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  min,
  max,
  step,
  className,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  hint?: ReactNode;
  min?: number;
  max?: number;
  step?: number | "any";
  className?: string;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      <div className="flex items-center rounded-md border border-input shadow-xs focus-within:ring-1 focus-within:ring-ring">
        {prefix && <span className="pl-3 text-sm text-muted-foreground">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step ?? "any"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full min-w-0 bg-transparent px-3 text-base outline-none md:text-sm"
        />
        {suffix && <span className="pr-3 text-sm text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </Field>
  );
}

export type Option<T extends string> = { value: T; label: ReactNode; disabled?: boolean };

/** Segmented button group for picking one of a few options. */
export function OptionPicker<T extends string>({
  value,
  onChange,
  options,
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: {
  value: T;
  // NoInfer: take T from `value` so string-literal state types aren't widened to string.
  onChange: (value: NoInfer<T>) => void;
  options: Option<NoInfer<T>>[];
  size?: "sm" | "default";
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          size={size}
          variant={value === option.value ? "default" : "outline"}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
