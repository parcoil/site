"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

type CopyButtonProps = Omit<ButtonProps, "onClick" | "children" | "value"> & {
  value: string;
  /** Visible label. Without one the button is icon-only. */
  label?: string;
  message?: string;
};

export default function CopyButton({
  value,
  label,
  message,
  variant = "outline",
  size,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    if (await copyText(value, message)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const Icon = copied ? Check : Copy;
  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (label ? "sm" : "icon")}
      onClick={handleCopy}
      disabled={!value}
      title="Copy to clipboard"
      aria-label={label ?? "Copy to clipboard"}
      {...props}
    >
      <Icon />
      {label}
    </Button>
  );
}
