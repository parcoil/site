"use client";
import { useState } from "react";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";

function slugify(line: string, separator: string, lowercase: boolean) {
  const slug = line
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: é → e
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, "g"), "");
  return lowercase ? slug.toLowerCase() : slug;
}

export default function SlugGenerator() {
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  return (
    <TextTransformer
      mono
      inputLabel="Titles (one per line)"
      outputLabel="Slugs"
      inputPlaceholder={"10 Tips for Café Owners & Baristas!\nWhat's New in 2026?"}
      modes={[
        {
          value: "slug",
          label: "Slugify",
          run: (text) =>
            text
              .split("\n")
              .map((line) => slugify(line, separator, lowercase))
              .join("\n"),
        },
      ]}
      options={
        <div className="flex flex-wrap items-end gap-6">
          <Field label="Separator">
            <OptionPicker
              value={separator}
              onChange={setSeparator}
              options={[
                { value: "-", label: "Hyphen (-)" },
                { value: "_", label: "Underscore (_)" },
                { value: ".", label: "Dot (.)" },
              ]}
            />
          </Field>
          <SwitchField label="Lowercase" checked={lowercase} onChange={setLowercase} className="h-9" />
        </div>
      }
    />
  );
}
