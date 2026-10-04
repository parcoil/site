"use client";
import { useId, useState, type ReactNode } from "react";
import { ArrowLeftRight, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker } from "@/components/tools/fields";
import { cn } from "@/lib/utils";

export type TextMode = {
  value: string;
  label: ReactNode;
  /** Pure transform. Throw an Error to show its message instead of output. */
  run: (input: string) => string;
};

type TextTransformerProps = {
  modes: TextMode[];
  /** Controlled mode, for tools whose options depend on it. */
  mode?: string;
  onModeChange?: (mode: string) => void;
  /** Extra controls shown under the mode picker. */
  options?: ReactNode;
  /** Content shown under the input/output pair; a function receives the current text. */
  footer?: ReactNode | ((text: { input: string; output: string; mode: string }) => ReactNode);
  initialInput?: string;
  inputLabel?: string;
  outputLabel?: string;
  inputPlaceholder?: string;
  mono?: boolean;
};

/** Live text in → text out tool with switchable modes (encode/decode, etc.). */
export default function TextTransformer({
  modes,
  mode: controlledMode,
  onModeChange,
  options,
  footer,
  initialInput = "",
  inputLabel = "Input",
  outputLabel = "Output",
  inputPlaceholder = "Type or paste text here…",
  mono = false,
}: TextTransformerProps) {
  const inputId = useId();
  const outputId = useId();
  const [input, setInput] = useState(initialInput);
  const [innerMode, setInnerMode] = useState(modes[0].value);
  const modeValue = controlledMode ?? innerMode;
  const active = modes.find((m) => m.value === modeValue) ?? modes[0];

  const setMode = (value: string) => {
    setInnerMode(value);
    onModeChange?.(value);
  };

  let output = "";
  let error = "";
  if (input) {
    try {
      output = active.run(input);
    } catch (e) {
      error = e instanceof Error ? e.message : "Couldn't convert this input.";
    }
  }

  // With exactly two modes (encode/decode) swapping also flips the mode.
  const canSwap = modes.length === 2 && !!output;
  const swap = () => {
    setInput(output);
    setMode(modes.find((m) => m.value !== active.value)!.value);
  };

  return (
    <ToolCard>
      {(modes.length > 1 || options) && (
        <div className="space-y-4">
          {modes.length > 1 && (
            <OptionPicker
              aria-label="Mode"
              value={active.value}
              onChange={setMode}
              options={modes.map(({ value, label }) => ({ value, label }))}
            />
          )}
          {options}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={inputLabel}
          htmlFor={inputId}
          extra={
            <div className="flex gap-2">
              {canSwap && (
                <Button type="button" variant="outline" size="sm" onClick={swap}>
                  <ArrowLeftRight /> Swap
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput("")}
                disabled={!input}
              >
                <Eraser /> Clear
              </Button>
            </div>
          }
        >
          <Textarea
            id={inputId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            spellCheck={false}
            className={cn("min-h-48 md:min-h-64", mono && "font-mono")}
          />
        </Field>

        <Field
          label={outputLabel}
          htmlFor={outputId}
          extra={<CopyButton value={output} label="Copy" />}
        >
          <Textarea
            id={outputId}
            value={output}
            readOnly
            placeholder="Result appears here"
            className={cn(
              "min-h-48 md:min-h-64 bg-muted/30",
              mono && "font-mono",
              error && "border-destructive",
            )}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </Field>
      </div>

      {typeof footer === "function" ? footer({ input, output, mode: active.value }) : footer}
    </ToolCard>
  );
}
