"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { copyText } from "@/lib/clipboard";
import { seededRandom } from "@/lib/random";

type Style = { name: string; convert: (text: string) => string };

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";

/** Maps A–Z, a–z and 0–9 onto a contiguous Unicode block, with per-letter exceptions. */
function block(upper: number, lower: number | null, digits: number | null = null, exceptions: Record<string, string> = {}) {
  return (text: string) =>
    Array.from(text, (c) => {
      if (exceptions[c]) return exceptions[c];
      const u = UPPER.indexOf(c);
      if (u >= 0) return String.fromCodePoint(upper + u);
      const l = LOWER.indexOf(c);
      if (l >= 0) return lower === null ? String.fromCodePoint(upper + l) : String.fromCodePoint(lower + l);
      const d = "0123456789".indexOf(c);
      if (d >= 0 && digits !== null) return String.fromCodePoint(digits + d);
      return c;
    }).join("");
}

function table(from: string, to: string) {
  const targets = Array.from(to);
  const map = new Map(Array.from(from).map((c, i) => [c, targets[i]]));
  return (text: string) => Array.from(text, (c) => map.get(c) ?? map.get(c.toLowerCase()) ?? c).join("");
}

const combine = (mark: string) => (text: string) =>
  Array.from(text, (c) => (c === " " ? c : c + mark)).join("");

const FLIP_FROM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?'\"()[]{}<>_&";
const FLIP_TO = "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀ꓭƆᗡƎℲ⅁HIſꓘ˥WNOԀΌᴚS⊥∩ΛMX⅄Z0ƖᄅƐㄣϛ9ㄥ86˙'¡¿,„)(][}{><‾⅋";

const ZALGO_MARKS = Array.from({ length: 0x36f - 0x300 + 1 }, (_, i) => String.fromCharCode(0x300 + i));

const STYLES: Style[] = [
  { name: "Bold", convert: block(0x1d400, 0x1d41a, 0x1d7ce) },
  { name: "Italic", convert: block(0x1d434, 0x1d44e, null, { h: "ℎ" }) },
  { name: "Bold Italic", convert: block(0x1d468, 0x1d482) },
  { name: "Script", convert: block(0x1d49c, 0x1d4b6, null, { B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ", e: "ℯ", g: "ℊ", o: "ℴ" }) },
  { name: "Bold Script", convert: block(0x1d4d0, 0x1d4ea) },
  { name: "Gothic", convert: block(0x1d504, 0x1d51e, null, { C: "ℭ", H: "ℌ", I: "ℑ", R: "ℜ", Z: "ℨ" }) },
  { name: "Bold Gothic", convert: block(0x1d56c, 0x1d586) },
  { name: "Double-struck", convert: block(0x1d538, 0x1d552, 0x1d7d8, { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" }) },
  { name: "Sans", convert: block(0x1d5a0, 0x1d5ba, 0x1d7e2) },
  { name: "Sans Bold", convert: block(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { name: "Sans Italic", convert: block(0x1d608, 0x1d622) },
  { name: "Sans Bold Italic", convert: block(0x1d63c, 0x1d656) },
  { name: "Monospace", convert: block(0x1d670, 0x1d68a, 0x1d7f6) },
  { name: "Wide", convert: (t) => block(0xff21, 0xff41, 0xff10)(t).replace(/ /g, "　") },
  { name: "Circled", convert: block(0x24b6, 0x24d0, null, Object.fromEntries([..."123456789"].map((d, i) => [d, String.fromCodePoint(0x2460 + i)]).concat([["0", "⓪"]]))) },
  { name: "Circled Negative", convert: block(0x1f150, null) },
  { name: "Squared", convert: block(0x1f130, null) },
  { name: "Squared Negative", convert: block(0x1f170, null) },
  { name: "Small Caps", convert: table(LOWER, "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ") },
  { name: "Superscript", convert: table(LOWER + "0123456789+-=()", "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾") },
  { name: "Upside Down", convert: (t) => Array.from(table(FLIP_FROM, FLIP_TO)(t)).reverse().join("") },
  { name: "Reversed", convert: (t) => Array.from(t).reverse().join("") },
  { name: "Strikethrough", convert: combine("̶") },
  { name: "Underline", convert: combine("̲") },
  { name: "Slashed", convert: combine("̸") },
  {
    name: "Glitch",
    convert: (t) => {
      const rand = seededRandom(t.length * 7919 + 1);
      return Array.from(t, (c) =>
        c === " " ? c : c + Array.from({ length: 1 + Math.floor(rand() * 4) }, () => ZALGO_MARKS[Math.floor(rand() * ZALGO_MARKS.length)]).join(""),
      ).join("");
    },
  },
];

export default function FancyText() {
  const [text, setText] = useState("Parcoil Tools");
  const source = text || "Type something";

  return (
    <ToolCard>
      <Textarea
        aria-label="Your text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something…"
        className="min-h-20 text-lg"
      />
      <ul className="grid gap-2 md:grid-cols-2">
        {STYLES.map((style) => {
          const output = style.convert(source);
          return (
            <li key={style.name} className="flex items-center gap-2 rounded-lg border p-3">
              <button
                type="button"
                onClick={() => copyText(output, `Copied ${style.name} text`)}
                className="min-w-0 flex-1 text-left"
                title="Click to copy"
              >
                <span className="block text-xs text-muted-foreground">{style.name}</span>
                <span className="block truncate text-lg">{output}</span>
              </button>
              <CopyButton value={output} message={`Copied ${style.name} text`} variant="ghost" />
            </li>
          );
        })}
      </ul>
    </ToolCard>
  );
}
