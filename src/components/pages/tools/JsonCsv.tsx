"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { flattenObject, inferType, parseCsv, stringifyCsv } from "@/lib/csv";
import { downloadText } from "@/lib/files";
import { parseJson } from "@/lib/json";

const DELIMITERS = { ",": "Comma", ";": "Semicolon", "\t": "Tab" } as const;
type Delimiter = keyof typeof DELIMITERS;

function jsonToCsv(text: string, delimiter: Delimiter) {
  const data = parseJson(text);
  const rows = (Array.isArray(data) ? data : [data]).map((item) => flattenObject(item));
  if (rows.length === 0) return "";
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return stringifyCsv([headers, ...rows.map((row) => headers.map((h) => row[h]))], delimiter);
}

function csvToJson(text: string, header: boolean, types: boolean) {
  const rows = parseCsv(text);
  const convert = (cell: string) => (types ? inferType(cell) : cell);
  if (!header) return JSON.stringify(rows.map((row) => row.map(convert)), null, 2);
  const [headers, ...body] = rows;
  return JSON.stringify(
    body.map((row) => Object.fromEntries(headers.map((h, i) => [h, convert(row[i] ?? "")]))),
    null,
    2,
  );
}

const SAMPLE = `[
  { "id": 1, "name": "Ada", "email": "ada@example.com", "address": { "city": "London" } },
  { "id": 2, "name": "Grace", "email": "grace@example.com", "address": { "city": "New York" } }
]`;

export default function JsonCsv() {
  const [mode, setMode] = useState("json");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [header, setHeader] = useState(true);
  const [types, setTypes] = useState(true);

  return (
    <TextTransformer
      mono
      mode={mode}
      onModeChange={setMode}
      initialInput={SAMPLE}
      modes={[
        { value: "json", label: "JSON → CSV", run: (t) => jsonToCsv(t, delimiter) },
        { value: "csv", label: "CSV → JSON", run: (t) => csvToJson(t, header, types) },
      ]}
      options={
        mode === "json" ? (
          <Field label="Delimiter">
            <OptionPicker
              value={delimiter}
              onChange={setDelimiter}
              options={(Object.keys(DELIMITERS) as Delimiter[]).map((d) => ({ value: d, label: DELIMITERS[d] }))}
            />
          </Field>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            <SwitchField label="First row is a header" checked={header} onChange={setHeader} />
            <SwitchField label="Detect numbers and booleans" checked={types} onChange={setTypes} />
          </div>
        )
      }
      footer={({ output, mode }) => (
        <Button
          variant="outline"
          disabled={!output}
          onClick={() =>
            mode === "json"
              ? downloadText(output, "data.csv", "text/csv")
              : downloadText(output, "data.json", "application/json")
          }
        >
          <Download /> Download {mode === "json" ? ".csv" : ".json"}
        </Button>
      )}
    />
  );
}
