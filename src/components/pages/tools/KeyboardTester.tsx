"use client";
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { Detail, DetailGrid } from "@/components/tools/stats";
import { cn } from "@/lib/utils";

/** [event.code, label, width in key units]; null is a gap. */
type KeyDef = [string, string, number?] | null;

const letters = (codes: string) => [...codes].map((c): KeyDef => [`Key${c}`, c]);

const MAIN: KeyDef[][] = [
  [["Escape", "Esc"], null, ...[1, 2, 3, 4].map((n): KeyDef => [`F${n}`, `F${n}`]), null, ...[5, 6, 7, 8].map((n): KeyDef => [`F${n}`, `F${n}`]), null, ...[9, 10, 11, 12].map((n): KeyDef => [`F${n}`, `F${n}`])],
  [["Backquote", "`"], ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n): KeyDef => [`Digit${n}`, String(n)]), ["Minus", "-"], ["Equal", "="], ["Backspace", "Backspace", 2]],
  [["Tab", "Tab", 1.5], ...letters("QWERTYUIOP"), ["BracketLeft", "["], ["BracketRight", "]"], ["Backslash", "\\", 1.5]],
  [["CapsLock", "Caps", 1.75], ...letters("ASDFGHJKL"), ["Semicolon", ";"], ["Quote", "'"], ["Enter", "Enter", 2.25]],
  [["ShiftLeft", "Shift", 2.25], ...letters("ZXCVBNM"), ["Comma", ","], ["Period", "."], ["Slash", "/"], ["ShiftRight", "Shift", 2.75]],
  [["ControlLeft", "Ctrl", 1.25], ["MetaLeft", "Win", 1.25], ["AltLeft", "Alt", 1.25], ["Space", "", 6.25], ["AltRight", "Alt", 1.25], ["MetaRight", "Win", 1.25], ["ContextMenu", "Menu", 1.25], ["ControlRight", "Ctrl", 1.25]],
];

const NAV: KeyDef[][] = [
  [["PrintScreen", "PrtSc"], ["ScrollLock", "ScrLk"], ["Pause", "Pause"]],
  [["Insert", "Ins"], ["Home", "Home"], ["PageUp", "PgUp"]],
  [["Delete", "Del"], ["End", "End"], ["PageDown", "PgDn"]],
  [],
  [null, ["ArrowUp", "↑"], null],
  [["ArrowLeft", "←"], ["ArrowDown", "↓"], ["ArrowRight", "→"]],
];

const NUMPAD: KeyDef[][] = [
  [],
  [["NumLock", "Num"], ["NumpadDivide", "/"], ["NumpadMultiply", "*"], ["NumpadSubtract", "-"]],
  [["Numpad7", "7"], ["Numpad8", "8"], ["Numpad9", "9"], ["NumpadAdd", "+"]],
  [["Numpad4", "4"], ["Numpad5", "5"], ["Numpad6", "6"], null],
  [["Numpad1", "1"], ["Numpad2", "2"], ["Numpad3", "3"], ["NumpadEnter", "Ent"]],
  [["Numpad0", "0", 2], ["NumpadDecimal", "."], null],
];

const ALL_CODES = [...MAIN, ...NAV, ...NUMPAD].flat().filter((k): k is [string, string, number?] => !!k).map((k) => k[0]);

type LastKey = { key: string; code: string; keyCode: number; location: number };

function Cluster({ rows, pressed, tested }: { rows: KeyDef[][]; pressed: Set<string>; tested: Set<string> }) {
  return (
    <div className="flex flex-col gap-1">
      {rows.map((row, r) => (
        <div key={r} className="flex h-(--key) gap-1">
          {row.map((key, i) =>
            key === null ? (
              <span key={i} className="w-(--key) shrink-0" />
            ) : (
              <kbd
                key={key[0]}
                title={key[0]}
                style={{ width: `calc(${key[2] ?? 1} * var(--key) + ${(key[2] ?? 1) - 1} * 0.25rem)` }}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-md border text-[11px] font-medium transition-colors duration-75",
                  pressed.has(key[0])
                    ? "border-primary bg-primary text-primary-foreground"
                    : tested.has(key[0])
                      ? "border-primary/40 bg-primary/20"
                      : "bg-muted/40 text-muted-foreground",
                )}
              >
                {key[1]}
              </kbd>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

export default function KeyboardTester() {
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [tested, setTested] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<LastKey | null>(null);
  const [maxSimultaneous, setMaxSimultaneous] = useState(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Let browser shortcuts like Ctrl+R and Ctrl+W still work.
      if (!e.ctrlKey && !e.metaKey) e.preventDefault();
      setLast({ key: e.key, code: e.code, keyCode: e.keyCode, location: e.location });
      setTested((t) => new Set(t).add(e.code));
      setPressed((p) => new Set(p).add(e.code));
    };
    const up = (e: KeyboardEvent) => {
      // Some keys (like Print Screen) only fire keyup.
      setTested((t) => new Set(t).add(e.code));
      setPressed((p) => {
        const next = new Set(p);
        next.delete(e.code);
        return next;
      });
    };
    const clear = () => setPressed(new Set());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => setMaxSimultaneous((m) => Math.max(m, pressed.size)), [pressed]);

  const testedCount = ALL_CODES.filter((c) => tested.has(c)).length;

  return (
    <ToolCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          <strong className="text-primary">{testedCount}</strong> of {ALL_CODES.length} keys tested
          {maxSimultaneous > 1 && <> · up to <strong>{maxSimultaneous}</strong> keys at once</>}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTested(new Set());
            setLast(null);
            setMaxSimultaneous(0);
          }}
        >
          <RotateCcw /> Reset
        </Button>
      </div>

      <div className="overflow-x-auto pb-2">
        {/* Key size; the full layout is ~25 keys wide. */}
        <div className="mx-auto flex w-max gap-3 [--key:2.125rem]">
          <Cluster rows={MAIN} pressed={pressed} tested={tested} />
          <Cluster rows={NAV} pressed={pressed} tested={tested} />
          <Cluster rows={NUMPAD} pressed={pressed} tested={tested} />
        </div>
      </div>

      {last ? (
        <DetailGrid className="md:grid-cols-4">
          <Detail label="event.key" value={last.key === " " ? "Space" : last.key} mono />
          <Detail label="event.code" value={last.code} mono />
          <Detail label="keyCode" value={String(last.keyCode)} mono />
          <Detail label="Location" value={["Standard", "Left", "Right", "Numpad"][last.location]} />
        </DetailGrid>
      ) : (
        <p className="text-center text-muted-foreground">Press any key to start testing.</p>
      )}
    </ToolCard>
  );
}
