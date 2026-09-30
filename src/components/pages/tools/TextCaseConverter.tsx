"use client";
import TextTransformer, { type TextMode } from "@/components/tools/TextTransformer";

/** Splits on separators and camelCase boundaries: "fooBar baz-qux" → [foo, Bar, baz, qux]. */
function splitWords(line: string) {
  return line
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

/** Applies a word-joining style to each line so multi-line input stays multi-line. */
const perLine = (join: (words: string[]) => string) => (text: string) =>
  text
    .split("\n")
    .map((line) => join(splitWords(line)))
    .join("\n");

const MODES: TextMode[] = [
  { value: "upper", label: "UPPERCASE", run: (t) => t.toUpperCase() },
  { value: "lower", label: "lowercase", run: (t) => t.toLowerCase() },
  {
    value: "title",
    label: "Title Case",
    run: (t) => t.toLowerCase().replace(/(^|[\s\-([{"'])(\p{L})/gu, (_, p, c) => p + c.toUpperCase()),
  },
  {
    value: "sentence",
    label: "Sentence case",
    run: (t) => t.toLowerCase().replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, (_, p, c) => p + c.toUpperCase()),
  },
  {
    value: "camel",
    label: "camelCase",
    run: perLine((w) => w.map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word))).join("")),
  },
  { value: "pascal", label: "PascalCase", run: perLine((w) => w.map(capitalize).join("")) },
  { value: "snake", label: "snake_case", run: perLine((w) => w.join("_").toLowerCase()) },
  { value: "kebab", label: "kebab-case", run: perLine((w) => w.join("-").toLowerCase()) },
  { value: "constant", label: "CONSTANT_CASE", run: perLine((w) => w.join("_").toUpperCase()) },
  { value: "dot", label: "dot.case", run: perLine((w) => w.join(".").toLowerCase()) },
  {
    value: "alternating",
    label: "aLtErNaTiNg cAsE",
    run: (t) => Array.from(t, (c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""),
  },
  {
    value: "inverse",
    label: "InVeRsE CaSe",
    run: (t) =>
      Array.from(t, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
  },
];

export default function TextCaseConverter() {
  return <TextTransformer modes={MODES} inputPlaceholder="Type or paste your text here…" />;
}
