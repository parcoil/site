"use client";
import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { diff } from "@/lib/diff";
import { cn } from "@/lib/utils";

type Part = { text: string; changed: boolean };
type Side = { number: number; parts: Part[] };
type Row = { type: "equal" | "delete" | "insert" | "change"; left?: Side; right?: Side };

const plain = (text: string): Part[] => [{ text, changed: false }];

/** Word-level diff of two lines, for highlighting what changed inside them. */
function wordDiff(a: string, b: string): [Part[], Part[]] {
  const wa = a.split(/(\s+)/);
  const wb = b.split(/(\s+)/);
  const left: Part[] = [];
  const right: Part[] = [];
  let i = 0;
  let j = 0;
  for (const op of diff(wa, wb)) {
    if (op.type === "equal") {
      const text = wa.slice(i, i + op.count).join("");
      left.push({ text, changed: false });
      right.push({ text, changed: false });
      i += op.count;
      j += op.count;
    } else if (op.type === "delete") {
      left.push({ text: wa.slice(i, (i += op.count)).join(""), changed: true });
    } else {
      right.push({ text: wb.slice(j, (j += op.count)).join(""), changed: true });
    }
  }
  return [left, right];
}

function buildRows(a: string[], b: string[], normalize: (s: string) => string): Row[] {
  const ops = diff(a.map(normalize), b.map(normalize));
  const rows: Row[] = [];
  let i = 0;
  let j = 0;
  for (let o = 0; o < ops.length; o++) {
    const op = ops[o];
    if (op.type === "equal") {
      for (let c = 0; c < op.count; c++, i++, j++) {
        rows.push({ type: "equal", left: { number: i + 1, parts: plain(a[i]) }, right: { number: j + 1, parts: plain(b[j]) } });
      }
    } else if (op.type === "delete" && ops[o + 1]?.type === "insert") {
      // Pair removed and added lines as modifications.
      const added = ops[++o].count;
      for (let c = 0; c < Math.max(op.count, added); c++) {
        if (c < op.count && c < added) {
          const [left, right] = wordDiff(a[i], b[j]);
          rows.push({ type: "change", left: { number: ++i, parts: left }, right: { number: ++j, parts: right } });
        } else if (c < op.count) {
          rows.push({ type: "delete", left: { number: ++i, parts: plain(a[i - 1]) } });
        } else {
          rows.push({ type: "insert", right: { number: ++j, parts: plain(b[j - 1]) } });
        }
      }
    } else if (op.type === "delete") {
      for (let c = 0; c < op.count; c++) rows.push({ type: "delete", left: { number: ++i, parts: plain(a[i - 1]) } });
    } else {
      for (let c = 0; c < op.count; c++) rows.push({ type: "insert", right: { number: ++j, parts: plain(b[j - 1]) } });
    }
  }
  return rows;
}

function Line({ side, kind }: { side?: Side; kind: "delete" | "insert" | "equal" }) {
  if (!side) return <td colSpan={2} className="bg-muted/30" />;
  const tone =
    kind === "delete" ? "bg-red-500/10" : kind === "insert" ? "bg-green-500/10" : "";
  const mark = kind === "delete" ? "bg-red-500/30" : "bg-green-500/30";
  return (
    <>
      <td className={cn("w-10 select-none px-2 text-right align-top text-muted-foreground", tone)}>{side.number}</td>
      <td className={cn("whitespace-pre-wrap wrap-break-word px-2 align-top", tone)}>
        {kind !== "equal" && <span className="select-none text-muted-foreground">{kind === "delete" ? "- " : "+ "}</span>}
        {side.parts.map((p, i) =>
          p.changed ? <mark key={i} className={cn("rounded-sm text-foreground", mark)}>{p.text}</mark> : <span key={i}>{p.text}</span>,
        )}
      </td>
    </>
  );
}

export default function TextDiff() {
  const [original, setOriginal] = useState("The quick brown fox\njumps over the lazy dog.\nIt was a sunny day.\nThe end.");
  const [changed, setChanged] = useState("The quick red fox\njumps over the lazy dog.\nIt was a rainy day in the park.\nSee you soon.\nThe end.");
  const [view, setView] = useState<"split" | "unified">("split");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const rows = useMemo(() => {
    const normalize = (s: string) => {
      let t = ignoreWhitespace ? s.trim().replace(/\s+/g, " ") : s;
      if (ignoreCase) t = t.toLowerCase();
      return t;
    };
    return buildRows(original.split(/\r?\n/), changed.split(/\r?\n/), normalize);
  }, [original, changed, ignoreCase, ignoreWhitespace]);

  const removed = rows.filter((r) => r.type === "delete" || r.type === "change").length;
  const added = rows.filter((r) => r.type === "insert" || r.type === "change").length;
  const identical = removed === 0 && added === 0;

  // Unified view lists each block's removed lines before its added lines.
  const unified = useMemo(() => {
    const out: { kind: "equal" | "delete" | "insert"; side: Side }[] = [];
    let block: Row[] = [];
    const flush = () => {
      block.forEach((r) => r.left && out.push({ kind: "delete", side: r.left }));
      block.forEach((r) => r.right && out.push({ kind: "insert", side: r.right }));
      block = [];
    };
    for (const row of rows) {
      if (row.type === "equal") {
        flush();
        out.push({ kind: "equal", side: row.right! });
      } else block.push(row);
    }
    flush();
    return out;
  }, [rows]);

  return (
    <ToolCard>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Original text" htmlFor="diff-a">
          <Textarea id="diff-a" value={original} onChange={(e) => setOriginal(e.target.value)} className="min-h-48 font-mono text-sm" spellCheck={false} />
        </Field>
        <Field
          label="Changed text"
          htmlFor="diff-b"
          extra={
            <Button variant="outline" size="sm" onClick={() => { setOriginal(changed); setChanged(original); }}>
              <ArrowLeftRight /> Swap
            </Button>
          }
        >
          <Textarea id="diff-b" value={changed} onChange={(e) => setChanged(e.target.value)} className="min-h-48 font-mono text-sm" spellCheck={false} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <OptionPicker
          value={view}
          onChange={setView}
          options={[
            { value: "split", label: "Side by side" },
            { value: "unified", label: "Unified" },
          ]}
        />
        <SwitchField label="Ignore case" checked={ignoreCase} onChange={setIgnoreCase} />
        <SwitchField label="Ignore whitespace" checked={ignoreWhitespace} onChange={setIgnoreWhitespace} />
      </div>

      <p className="text-sm">
        {identical ? (
          <span className="font-medium text-green-600 dark:text-green-400">The texts are identical.</span>
        ) : (
          <>
            <span className="font-medium text-red-600 dark:text-red-400">−{removed} removed</span>
            {" · "}
            <span className="font-medium text-green-600 dark:text-green-400">+{added} added</span>
          </>
        )}
      </p>

      <div className="max-h-[70vh] overflow-auto rounded-lg border">
        <table className="w-full border-collapse font-mono text-xs sm:text-sm">
          <tbody>
            {view === "split"
              ? rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <Line side={row.left} kind={row.type === "equal" ? "equal" : "delete"} />
                    <Line side={row.right} kind={row.type === "equal" ? "equal" : "insert"} />
                  </tr>
                ))
              : unified.map((line, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <Line side={line.side} kind={line.kind} />
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </ToolCard>
  );
}
