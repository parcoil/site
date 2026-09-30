"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { OptionPicker } from "@/components/tools/fields";
import { Stat, StatGrid } from "@/components/tools/stats";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { randomItem } from "@/lib/random";
import { cn } from "@/lib/utils";

const WORDS =
  "the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is was are been has had were said did made find very still between call world may where much should old while might place great same own under last never high long little small large next early young important few public bad able hand part point home keep left life turn start show try ask need feel seem leave put mean let begin help talk off play run move live believe hold bring happen write provide sit stand lose pay meet include continue set learn change lead understand watch follow stop create speak read allow add spend grow open walk win offer remember love consider appear buy wait serve die send expect build stay fall cut reach kill remain".split(
    " ",
  );
const DURATIONS = ["15", "30", "60", "120"] as const;

const makeText = () => Array.from({ length: 300 }, () => randomItem(WORDS)).join(" ");

export default function TypingTest() {
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("60");
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [keystrokes, setKeystrokes] = useState({ total: 0, errors: 0 });
  const [best, setBest] = useLocalStorage<number>("parcoil-typing-best", 0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const bestAtStart = useRef(0);

  const seconds = Number(duration);
  const elapsed = startedAt ? Math.min(seconds, (now - startedAt) / 1000) : 0;
  const finished = startedAt !== null && elapsed >= seconds;

  const restart = useCallback(() => {
    setText(makeText());
    setTyped("");
    setStartedAt(null);
    setKeystrokes({ total: 0, errors: 0 });
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(restart, [restart, duration]);

  useEffect(() => {
    if (!startedAt || finished) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, finished]);

  // Keep the current line in view.
  useEffect(() => {
    const box = boxRef.current;
    const caret = caretRef.current;
    if (box && caret) box.scrollTop = Math.max(0, caret.offsetTop - box.offsetTop - 44);
  }, [typed]);

  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
  // The first few seconds are too short a sample; extrapolating them gives silly numbers.
  const measurable = elapsed >= 3;
  const minutes = elapsed / 60;
  const wpm = measurable ? Math.round(correct / 5 / minutes) : 0;
  const rawWpm = measurable ? Math.round(typed.length / 5 / minutes) : 0;
  const accuracy = keystrokes.total ? Math.round(((keystrokes.total - keystrokes.errors) / keystrokes.total) * 100) : 100;

  useEffect(() => {
    if (finished && wpm > best) setBest(wpm);
  }, [finished, wpm, best, setBest]);

  const onType = (value: string) => {
    if (finished) return;
    if (!startedAt) {
      const t = Date.now();
      bestAtStart.current = best;
      setStartedAt(t);
      setNow(t);
    }
    if (value.length > typed.length) {
      const added = value.slice(typed.length);
      const errors = [...added].filter((c, i) => c !== text[typed.length + i]).length;
      setKeystrokes((k) => ({ total: k.total + added.length, errors: k.errors + errors }));
    }
    setTyped(value);
  };

  return (
    <ToolCard className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OptionPicker
          value={duration}
          onChange={setDuration}
          options={DURATIONS.map((d) => ({ value: d, label: `${d}s`, disabled: startedAt !== null && !finished }))}
        />
        <div className="flex items-center gap-3">
          {best > 0 && <span className="text-sm text-muted-foreground">Best: {best} WPM</span>}
          <Button variant="outline" size="sm" onClick={restart}>
            <RotateCcw /> Restart
          </Button>
        </div>
      </div>

      <StatGrid>
        <Stat label="Time left" value={`${Math.ceil(seconds - elapsed)}s`} />
        <Stat label="WPM" value={measurable ? wpm : "—"} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Raw WPM" value={measurable ? rawWpm : "—"} />
      </StatGrid>

      <div
        className="relative cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div
          ref={boxRef}
          className="h-36 overflow-hidden rounded-lg border bg-muted/20 p-4 font-mono text-xl leading-[2.75rem] tracking-wide select-none"
        >
          {Array.from(text).map((char, i) => (
            <span
              key={i}
              ref={i === typed.length ? caretRef : undefined}
              className={cn(
                i < typed.length
                  ? typed[i] === char
                    ? "text-foreground"
                    : "rounded-sm bg-destructive/20 text-destructive"
                  : "text-muted-foreground/60",
                i === typed.length && !finished && "border-l-2 border-primary animate-pulse",
              )}
            >
              {char}
            </span>
          ))}
        </div>
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onType(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Type the text shown above"
          className="absolute inset-0 h-full w-full resize-none opacity-0"
        />
        {!startedAt && (
          <p className="pointer-events-none absolute inset-x-0 -bottom-7 text-center text-sm text-muted-foreground">
            Click the text and start typing. The timer starts on your first key.
          </p>
        )}
      </div>

      {finished && (
        <div className="rounded-lg bg-primary/10 p-6 text-center">
          <p className="text-5xl font-bold text-primary">{wpm} WPM</p>
          <p className="mt-1 text-muted-foreground">
            {accuracy}% accuracy · {correct} correct characters in {seconds} seconds
            {wpm > bestAtStart.current ? " · New personal best! 🎉" : ""}
          </p>
          <Button className="mt-4" onClick={restart}>
            <RotateCcw /> Try again
          </Button>
        </div>
      )}
    </ToolCard>
  );
}
