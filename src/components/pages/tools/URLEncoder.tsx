"use client";
import { useState } from "react";
import TextTransformer from "@/components/tools/TextTransformer";
import { SwitchField } from "@/components/tools/fields";

function decode(input: string, plusAsSpace: boolean) {
  try {
    return decodeURIComponent(plusAsSpace ? input.replace(/\+/g, " ") : input);
  } catch {
    throw new Error("This contains an invalid percent-encoded sequence.");
  }
}

export default function URLEncoder() {
  const [fullUrl, setFullUrl] = useState(false);
  const [plusAsSpace, setPlusAsSpace] = useState(true);
  const [mode, setMode] = useState("encode");

  return (
    <TextTransformer
      mode={mode}
      onModeChange={setMode}
      modes={[
        {
          value: "encode",
          label: "Encode",
          run: (text) => (fullUrl ? encodeURI(text) : encodeURIComponent(text)),
        },
        { value: "decode", label: "Decode", run: (text) => decode(text, plusAsSpace) },
      ]}
      options={
        mode === "encode" ? (
          <SwitchField
            className="max-w-md"
            label="Encode as a full URL"
            description="Keep characters like : / ? & = intact. Turn off to encode a single query value."
            checked={fullUrl}
            onChange={setFullUrl}
          />
        ) : (
          <SwitchField
            className="max-w-md"
            label="Treat + as a space"
            description="Form submissions encode spaces as +."
            checked={plusAsSpace}
            onChange={setPlusAsSpace}
          />
        )
      }
    />
  );
}
