"use client";
import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import ToolCard from "@/components/tools/ToolCard";
import { Stat, StatGrid } from "@/components/tools/stats";

const STOP_WORDS = new Set(
  "a an and are as at be but by for from has have he her his i in is it its of on or our she so that the their them they this to was we were will with you your not do does did can could would should than then there these those what when which who how all any if into about just also more most very".split(
    " ",
  ),
);

const wordSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "word" })
    : null;
const sentenceSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "sentence" })
    : null;

function getWords(text: string) {
  if (!wordSegmenter) return text.match(/[\p{L}\p{N}'’-]+/gu) ?? [];
  return Array.from(wordSegmenter.segment(text))
    .filter((s) => s.isWordLike)
    .map((s) => s.segment);
}

function countSentences(text: string) {
  if (!text.trim()) return 0;
  if (!sentenceSegmenter) return text.split(/[.!?]+\s/).filter((s) => s.trim()).length;
  return Array.from(sentenceSegmenter.segment(text)).filter((s) => s.segment.trim()).length;
}

function formatDuration(minutes: number) {
  if (minutes === 0) return "0 sec";
  const seconds = Math.max(1, Math.round(minutes * 60));
  return seconds < 60 ? `${seconds} sec` : `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = getWords(text);
    const frequencies = new Map<string, number>();
    for (const word of words) {
      const key = word.toLowerCase();
      if (key.length > 2 && !STOP_WORDS.has(key) && !/^\d+$/.test(key)) {
        frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
      }
    }
    return {
      words: words.length,
      characters: Array.from(text).length,
      charactersNoSpaces: Array.from(text.replace(/\s/g, "")).length,
      sentences: countSentences(text),
      paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim()).length,
      lines: text ? text.split("\n").length : 0,
      reading: formatDuration(words.length / 238),
      speaking: formatDuration(words.length / 150),
      keywords: [...frequencies.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }, [text]);

  return (
    <ToolCard>
      <Textarea
        aria-label="Text to count"
        placeholder="Start typing or paste your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-56"
      />

      <StatGrid>
        <Stat label="Words" value={stats.words.toLocaleString()} />
        <Stat label="Characters" value={stats.characters.toLocaleString()} />
        <Stat label="Characters (no spaces)" value={stats.charactersNoSpaces.toLocaleString()} />
        <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
        <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
        <Stat label="Lines" value={stats.lines.toLocaleString()} />
        <Stat label="Reading time" value={stats.reading} />
        <Stat label="Speaking time" value={stats.speaking} />
      </StatGrid>

      {stats.keywords.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Keyword density</h2>
          <div className="flex flex-wrap gap-2">
            {stats.keywords.map(([word, count]) => (
              <span key={word} className="rounded-full border bg-muted/30 px-3 py-1 text-sm">
                {word}{" "}
                <span className="text-muted-foreground">
                  {count} · {((count / stats.words) * 100).toFixed(1)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </ToolCard>
  );
}
