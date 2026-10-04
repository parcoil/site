"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField, SwitchField } from "@/components/tools/fields";
import { randomBetween, randomItem } from "@/lib/random";

const WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis et commodo pharetra est eros bibendum elit nec luctus magna felis sollicitudin mauris integer in mauris eu nibh euismod gravida duis ac tellus et risus vulputate vehicula donec lobortis risus a elit etiam tempor ut ullamcorper ligula eu tempor congue eros est euismod turpis id tincidunt sapien risus a quam maecenas fermentum consequat mi donec fermentum pellentesque malesuada nulla a mi duis sapien sem aliquet nec commodo eget consequat quis neque aliquam faucibus".split(
    " ",
  );
const CLASSIC = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

type Unit = "paragraphs" | "sentences" | "words";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function sentence() {
  const words = Array.from({ length: randomBetween(6, 16) }, () => randomItem(WORDS));
  // An occasional comma makes the rhythm feel natural.
  if (words.length > 8) words[randomBetween(3, words.length - 4)] += ",";
  return capitalize(words.join(" ")) + ".";
}

const paragraph = () => Array.from({ length: randomBetween(4, 7) }, sentence).join(" ");

function generate(unit: Unit, count: number, classic: boolean, html: boolean) {
  let blocks: string[];
  if (unit === "words") {
    const words = Array.from({ length: count }, () => randomItem(WORDS));
    if (classic) words.splice(0, Math.min(count, 5), ..."lorem ipsum dolor sit amet".split(" ").slice(0, count));
    blocks = [capitalize(words.join(" ")) + "."];
  } else if (unit === "sentences") {
    const sentences = Array.from({ length: count }, sentence);
    if (classic) sentences[0] = CLASSIC;
    blocks = [sentences.join(" ")];
  } else {
    blocks = Array.from({ length: count }, paragraph);
    if (classic) blocks[0] = `${CLASSIC} ${blocks[0]}`;
  }
  return html ? blocks.map((b) => `<p>${b}</p>`).join("\n") : blocks.join("\n\n");
}

export default function LoremIpsum() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [html, setHtml] = useState(false);
  const [text, setText] = useState("");

  const regenerate = useCallback(() => setText(generate(unit, count, classic, html)), [unit, count, classic, html]);
  useEffect(regenerate, [regenerate]);

  const max = unit === "words" ? 500 : unit === "sentences" ? 50 : 20;

  return (
    <ToolCard className="max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Generate">
          <OptionPicker
            value={unit}
            onChange={(u) => {
              setUnit(u);
              setCount(u === "words" ? 50 : u === "sentences" ? 5 : 3);
            }}
            options={[
              { value: "paragraphs", label: "Paragraphs" },
              { value: "sentences", label: "Sentences" },
              { value: "words", label: "Words" },
            ]}
          />
        </Field>
        <SliderField label={`Number of ${unit}`} value={Math.min(count, max)} onChange={setCount} min={1} max={max} />
        <SwitchField label='Start with "Lorem ipsum…"' checked={classic} onChange={setClassic} />
        <SwitchField label="Wrap in <p> tags" checked={html} onChange={setHtml} />
      </div>
      <OutputField multiline label="Placeholder text" value={text} inputClassName="min-h-72" />
      <Button onClick={regenerate}>
        <RefreshCw /> Generate new text
      </Button>
    </ToolCard>
  );
}
