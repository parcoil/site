"use client";
import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { bytesToHex } from "@/lib/encoding";
import { downloadText } from "@/lib/files";

type Version = "v4" | "v7";

/** RFC 9562 UUIDv7: 48-bit millisecond timestamp followed by random bits. */
function uuidv7() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const now = Date.now();
  for (let i = 0; i < 6; i++) bytes[i] = Math.floor(now / 2 ** (8 * (5 - i))) & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UUIDGenerator() {
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = useCallback(() => {
    setUuids(
      Array.from({ length: count }, () => (version === "v4" ? crypto.randomUUID() : uuidv7())),
    );
  }, [count, version]);

  useEffect(generate, [generate]);

  const output = uuids
    .map((id) => {
      let formatted = hyphens ? id : id.replace(/-/g, "");
      if (uppercase) formatted = formatted.toUpperCase();
      return braces ? `{${formatted}}` : formatted;
    })
    .join("\n");

  return (
    <ToolCard className="max-w-3xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Version">
          <OptionPicker
            value={version}
            onChange={setVersion}
            options={[
              { value: "v4", label: "v4 (random)" },
              { value: "v7", label: "v7 (time-ordered)" },
            ]}
          />
        </Field>
        <SliderField label="How many" value={count} onChange={setCount} min={1} max={100} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SwitchField label="Uppercase" checked={uppercase} onChange={setUppercase} />
        <SwitchField label="Hyphens" checked={hyphens} onChange={setHyphens} />
        <SwitchField label="Braces {}" checked={braces} onChange={setBraces} />
      </div>

      <OutputField
        multiline
        mono
        label={count === 1 ? "Your UUID" : `${count} UUIDs`}
        value={output}
        inputClassName="min-h-48"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate}>
          <RefreshCw /> Generate new
        </Button>
        <Button variant="outline" onClick={() => downloadText(output, "uuids.txt")} disabled={!output}>
          <Download /> Download .txt
        </Button>
      </div>
    </ToolCard>
  );
}
