"use client";
import { useState } from "react";
import TextTransformer from "@/components/tools/TextTransformer";
import { SwitchField } from "@/components/tools/fields";

const BASIC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function encode(text: string, allNonAscii: boolean) {
  const escaped = text.replace(/[&<>"']/g, (c) => BASIC[c]);
  if (!allNonAscii) return escaped;
  return Array.from(escaped, (c) => {
    const code = c.codePointAt(0)!;
    return code > 126 ? `&#${code};` : c;
  }).join("");
}

function decode(text: string) {
  // A detached <textarea> parses its contents as text, so entities are decoded
  // but tags are never interpreted and scripts never run.
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

export default function HtmlEntities() {
  const [allNonAscii, setAllNonAscii] = useState(false);
  return (
    <TextTransformer
      mono
      inputPlaceholder={'<a href="/">Tom & Jerry</a>'}
      modes={[
        { value: "encode", label: "Encode", run: (t) => encode(t, allNonAscii) },
        { value: "decode", label: "Decode", run: decode },
      ]}
      options={
        <SwitchField
          className="max-w-md"
          label="Encode all non-ASCII characters"
          description="Turn characters like é, € and emoji into numeric entities too."
          checked={allNonAscii}
          onChange={setAllNonAscii}
        />
      }
    />
  );
}
