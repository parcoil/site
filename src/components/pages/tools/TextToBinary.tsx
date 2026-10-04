"use client";
import { useState } from "react";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, OptionPicker } from "@/components/tools/fields";
import { utf8Decode, utf8Encode } from "@/lib/encoding";

type Format = "binary" | "hex" | "octal" | "decimal";

const FORMATS: Record<Format, { label: string; radix: number; width: number; digits: RegExp }> = {
  binary: { label: "Binary", radix: 2, width: 8, digits: /^[01]+$/ },
  hex: { label: "Hex", radix: 16, width: 2, digits: /^[0-9a-f]+$/i },
  octal: { label: "Octal", radix: 8, width: 3, digits: /^[0-7]+$/ },
  decimal: { label: "Decimal", radix: 10, width: 0, digits: /^\d+$/ },
};

function encode(text: string, format: Format, spaced: boolean) {
  const { radix, width } = FORMATS[format];
  return Array.from(utf8Encode(text), (b) => b.toString(radix).padStart(width, "0")).join(
    spaced || !width ? " " : "",
  );
}

function decode(input: string, format: Format) {
  const { radix, width, digits, label } = FORMATS[format];
  let tokens = input
    .trim()
    .split(/[\s,]+/)
    .map((t) => t.replace(/^0[xbo]/i, ""))
    .filter(Boolean);
  // Unseparated input like "0100100001101001" is split into fixed-width bytes.
  if (tokens.length === 1 && width && tokens[0].length > width) {
    tokens = tokens[0].match(new RegExp(`.{1,${width}}`, "g"))!;
  }
  const bytes = tokens.map((token) => {
    const value = parseInt(token, radix);
    if (!digits.test(token) || value > 255) {
      throw new Error(`"${token}" isn't a valid ${label.toLowerCase()} byte.`);
    }
    return value;
  });
  return utf8Decode(new Uint8Array(bytes));
}

export default function TextToBinary() {
  const [format, setFormat] = useState<Format>("binary");
  const [spaced, setSpaced] = useState(true);

  return (
    <TextTransformer
      mono
      modes={[
        { value: "encode", label: `Text → ${FORMATS[format].label}`, run: (t) => encode(t, format, spaced) },
        { value: "decode", label: `${FORMATS[format].label} → Text`, run: (t) => decode(t, format) },
      ]}
      options={
        <div className="flex flex-wrap gap-6">
          <Field label="Number format">
            <OptionPicker
              value={format}
              onChange={setFormat}
              options={(Object.keys(FORMATS) as Format[]).map((f) => ({ value: f, label: FORMATS[f].label }))}
            />
          </Field>
          <Field label="Separator">
            <OptionPicker
              value={spaced ? "space" : "none"}
              onChange={(v) => setSpaced(v === "space")}
              options={[
                { value: "space", label: "Space" },
                { value: "none", label: "None", disabled: format === "decimal" },
              ]}
            />
          </Field>
        </div>
      }
    />
  );
}
