"use client";
import { useState } from "react";
import { CircleCheck } from "lucide-react";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { formatBytes } from "@/lib/files";
import { parseJson, sortKeysDeep } from "@/lib/json";

const INDENTS = { "2": 2, "4": 4, tab: "\t" } as const;
type Indent = keyof typeof INDENTS;

const SAMPLE = '{"name":"Parcoil","tools":["json","base64"],"free":true,"stats":{"users":1200}}';

export default function JSONFormatter() {
  const [indent, setIndent] = useState<Indent>("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [mode, setMode] = useState("format");

  const prepare = (text: string) => {
    const value = parseJson(text);
    return sortKeys ? sortKeysDeep(value) : value;
  };

  return (
    <TextTransformer
      mono
      mode={mode}
      onModeChange={setMode}
      initialInput={SAMPLE}
      inputLabel="JSON input"
      inputPlaceholder='{"paste": "your JSON here"}'
      modes={[
        { value: "format", label: "Format", run: (t) => JSON.stringify(prepare(t), null, INDENTS[indent]) },
        { value: "minify", label: "Minify", run: (t) => JSON.stringify(prepare(t)) },
      ]}
      options={
        <div className="flex flex-wrap items-end gap-6">
          {mode === "format" && (
            <Field label="Indentation">
              <OptionPicker
                value={indent}
                onChange={setIndent}
                options={[
                  { value: "2", label: "2 spaces" },
                  { value: "4", label: "4 spaces" },
                  { value: "tab", label: "Tabs" },
                ]}
              />
            </Field>
          )}
          <SwitchField label="Sort keys A → Z" checked={sortKeys} onChange={setSortKeys} className="h-9" />
        </div>
      }
      footer={({ input, output }) =>
        output && (
          <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CircleCheck className="h-4 w-4" />
            Valid JSON · {formatBytes(new Blob([input]).size)} in,{" "}
            {formatBytes(new Blob([output]).size)} out
          </p>
        )
      }
    />
  );
}
