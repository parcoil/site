"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import TextTransformer from "@/components/tools/TextTransformer";
import { Field, SwitchField } from "@/components/tools/fields";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function FindReplace() {
  const [find, setFind] = useState("cat");
  const [replace, setReplace] = useState("dog");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(true);
  const [useRegex, setUseRegex] = useState(false);

  const buildRegex = () => {
    let source = useRegex ? find : escapeRegex(find);
    if (wholeWord) source = `\\b(?:${source})\\b`;
    try {
      return new RegExp(source, caseSensitive ? "g" : "gi");
    } catch (e) {
      throw new Error(`Invalid regular expression: ${(e as Error).message}`);
    }
  };

  const run = (text: string) => {
    if (!find) return text;
    const regex = buildRegex();
    // Without regex mode, "$" in the replacement is literal.
    return useRegex ? text.replace(regex, replace) : text.replace(regex, () => replace);
  };

  const countMatches = (text: string) => {
    if (!find || !text) return 0;
    try {
      return text.match(buildRegex())?.length ?? 0;
    } catch {
      return 0;
    }
  };

  return (
    <TextTransformer
      initialInput="The cat sat on the mat. My cat's name is Cat. Concatenate is not a cat."
      modes={[{ value: "replace", label: "Replace", run }]}
      options={
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Find" htmlFor="find">
              <Input id="find" value={find} onChange={(e) => setFind(e.target.value)} className="font-mono" />
            </Field>
            <Field label="Replace with" htmlFor="replace" hint={useRegex ? "Use $1, $2 or $<name> for captured groups." : undefined}>
              <Input id="replace" value={replace} onChange={(e) => setReplace(e.target.value)} className="font-mono" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <SwitchField label="Match case" checked={caseSensitive} onChange={setCaseSensitive} />
            <SwitchField label="Whole words only" checked={wholeWord} onChange={setWholeWord} />
            <SwitchField label="Regular expression" checked={useRegex} onChange={setUseRegex} />
          </div>
        </div>
      }
      footer={({ input }) => {
        const count = countMatches(input);
        return (
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "match" : "matches"} replaced
          </p>
        );
      }}
    />
  );
}
