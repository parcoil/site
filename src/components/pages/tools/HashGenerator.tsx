"use client";
import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileDropzone from "@/components/tools/FileDropzone";
import FileInfoBar from "@/components/tools/FileInfoBar";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { bytesToHex, utf8Encode } from "@/lib/encoding";
import { md5 } from "@/lib/md5";

const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algorithm = (typeof ALGORITHMS)[number];
type Hashes = Partial<Record<Algorithm, string>>;

async function hashAll(bytes: Uint8Array): Promise<Hashes> {
  const entries = await Promise.all(
    ALGORITHMS.map(async (algorithm) => {
      const digest =
        algorithm === "MD5"
          ? md5(bytes)
          : new Uint8Array(await crypto.subtle.digest(algorithm, bytes as BufferSource));
      return [algorithm, bytesToHex(digest)] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export default function HashGenerator() {
  const [source, setSource] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Hashes>({});
  const [busy, setBusy] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [expected, setExpected] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (source === "text" ? !text : !file) {
        setHashes({});
        setBusy(false);
        return;
      }
      setBusy(true);
      const bytes =
        source === "text" ? utf8Encode(text) : new Uint8Array(await file!.arrayBuffer());
      const result = await hashAll(bytes);
      if (!cancelled) {
        setHashes(result);
        setBusy(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [source, text, file]);

  const normalizedExpected = expected.trim().toLowerCase();
  const match = normalizedExpected
    ? ALGORITHMS.find((a) => hashes[a] === normalizedExpected)
    : undefined;

  return (
    <ToolCard>
      <OptionPicker
        aria-label="Input source"
        value={source}
        onChange={setSource}
        options={[
          { value: "text", label: "Text" },
          { value: "file", label: "File" },
        ]}
      />

      {source === "text" ? (
        <Field label="Text to hash" htmlFor="hash-text">
          <Textarea
            id="hash-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text…"
            className="min-h-32"
          />
        </Field>
      ) : file ? (
        <FileInfoBar file={file} onClear={() => setFile(null)} />
      ) : (
        <FileDropzone
          onFiles={([f]) => setFile(f)}
          label="Drop a file to calculate its checksum"
          hint="Any file type. The file is read locally and never uploaded."
        />
      )}

      <SwitchField
        className="max-w-xs"
        label="Uppercase output"
        checked={uppercase}
        onChange={setUppercase}
      />

      <div className="space-y-4">
        {ALGORITHMS.map((algorithm) => {
          const value = hashes[algorithm] ?? "";
          return (
            <OutputField
              key={algorithm}
              mono
              label={
                <span className="flex items-center gap-2">
                  {algorithm}
                  {match === algorithm && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CircleCheck className="h-4 w-4" /> Matches
                    </span>
                  )}
                </span>
              }
              value={uppercase ? value.toUpperCase() : value}
              placeholder={busy ? "Hashing…" : ""}
              inputClassName={match === algorithm ? "border-green-500" : undefined}
            />
          );
        })}
      </div>

      <Field
        label="Verify a checksum"
        htmlFor="expected-hash"
        hint={
          normalizedExpected
            ? match
              ? `Match found: this is the ${match} hash.`
              : "No match against any of the hashes above."
            : "Paste a published hash to check a download hasn't been tampered with."
        }
      >
        <Input
          id="expected-hash"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="e.g. 9f86d081884c7d659a2feaa0c55ad015…"
          className="font-mono"
        />
      </Field>
    </ToolCard>
  );
}
