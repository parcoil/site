"use client";
import { useId, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/tools/CopyButton";
import { Field } from "@/components/tools/fields";
import { cn } from "@/lib/utils";

/** Read-only value with a label and copy button. */
export default function OutputField({
  label,
  value,
  multiline = false,
  mono = false,
  placeholder,
  className,
  inputClassName,
}: {
  label: ReactNode;
  value: string;
  multiline?: boolean;
  mono?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const id = useId();
  const shared = {
    id,
    value,
    readOnly: true,
    placeholder,
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.target.select(),
    className: cn(mono && "font-mono", inputClassName),
  };

  if (multiline) {
    return (
      <Field
        label={label}
        htmlFor={id}
        className={className}
        extra={<CopyButton value={value} label="Copy" />}
      >
        <Textarea {...shared} className={cn("min-h-32", shared.className)} />
      </Field>
    );
  }

  return (
    <Field label={label} htmlFor={id} className={className}>
      <div className="flex gap-2">
        <Input {...shared} />
        <CopyButton value={value} />
      </div>
    </Field>
  );
}
