"use client";
import { useState } from "react";
import TextTransformer from "@/components/tools/TextTransformer";
import { SwitchField } from "@/components/tools/fields";
import { decodeBase64, encodeBase64 } from "@/lib/encoding";

export default function Base64() {
  const [urlSafe, setUrlSafe] = useState(false);

  return (
    <TextTransformer
      mono
      modes={[
        { value: "encode", label: "Encode", run: (text) => encodeBase64(text, urlSafe) },
        { value: "decode", label: "Decode", run: decodeBase64 },
      ]}
      options={
        <SwitchField
          className="max-w-md"
          label="URL-safe Base64"
          description="Use - and _ instead of + and /, and drop = padding when encoding."
          checked={urlSafe}
          onChange={setUrlSafe}
        />
      }
    />
  );
}
