"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { OptionPicker } from "@/components/tools/fields";
import { downloadText } from "@/lib/files";

// remark-html sanitizes its output by default, so raw HTML in the input can't run scripts.
const processor = remark().use(remarkGfm).use(remarkHtml);

const SAMPLE = `# Welcome to the Markdown Editor

Write on the left and see the **preview** on the right. It supports *GitHub Flavored Markdown*.

## Lists

- [x] Task lists
- [ ] ~~Strikethrough~~
- Links like [Parcoil](https://parcoil.com)

1. Numbered
2. Lists

## Code

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Tables

| Tool | Runs in browser |
| --- | :---: |
| Markdown Editor | ✅ |
| Image Converter | ✅ |

> Blockquotes work too.
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [view, setView] = useState<"split" | "write" | "preview">("split");
  const html = useMemo(() => String(processor.processSync(markdown)), [markdown]);
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  const fullDocument = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Document</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.6}pre{background:#f4f4f5;padding:1rem;overflow:auto;border-radius:6px}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.4rem .8rem}blockquote{border-left:4px solid #ddd;margin:0;padding-left:1rem;color:#555}</style>
</head>
<body>
${html}</body>
</html>`;

  return (
    <ToolCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OptionPicker
          value={view}
          onChange={setView}
          options={[
            { value: "split", label: "Split" },
            { value: "write", label: "Write" },
            { value: "preview", label: "Preview" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <CopyButton value={html} label="Copy HTML" />
          <Button variant="outline" size="sm" onClick={() => downloadText(markdown, "document.md", "text/markdown")}>
            <Download /> .md
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadText(fullDocument, "document.html", "text/html")}>
            <Download /> .html
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 ${view === "split" ? "md:grid-cols-2" : ""}`}>
        {view !== "preview" && (
          <Textarea
            aria-label="Markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[60vh] font-mono text-sm"
            spellCheck={false}
          />
        )}
        {view !== "write" && (
          <div
            className="prose dark:prose-invert max-w-none min-h-[60vh] overflow-auto rounded-md border p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {words.toLocaleString()} words · {markdown.length.toLocaleString()} characters
      </p>
    </ToolCard>
  );
}
