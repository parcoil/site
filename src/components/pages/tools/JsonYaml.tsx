"use client";
import { useState } from "react";
import YAML from "yaml";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, OptionPicker } from "@/components/tools/fields";
import { parseJson } from "@/lib/json";

const SAMPLE = `{
  "services": {
    "web": {
      "image": "nginx:latest",
      "ports": ["80:80"],
      "environment": { "NODE_ENV": "production" }
    }
  }
}`;

function yamlToJson(text: string, indent: number) {
  const documents = YAML.parseAllDocuments(text);
  const errors = documents.flatMap((d) => d.errors);
  if (errors.length) throw new Error(errors[0].message);
  const values = documents.map((d) => d.toJS());
  return JSON.stringify(values.length === 1 ? values[0] : values, null, indent);
}

export default function JsonYaml() {
  const [indent, setIndent] = useState<"2" | "4">("2");

  return (
    <TextTransformer
      mono
      initialInput={SAMPLE}
      modes={[
        {
          value: "json",
          label: "JSON → YAML",
          run: (t) => YAML.stringify(parseJson(t), { indent: Number(indent), lineWidth: 0 }),
        },
        { value: "yaml", label: "YAML → JSON", run: (t) => yamlToJson(t, Number(indent)) },
      ]}
      options={
        <Field label="Indentation">
          <OptionPicker
            value={indent}
            onChange={setIndent}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
            ]}
          />
        </Field>
      }
    />
  );
}
