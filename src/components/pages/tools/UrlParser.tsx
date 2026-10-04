"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { Detail, DetailGrid } from "@/components/tools/stats";

function parse(input: string): URL | null {
  const text = input.trim();
  if (!text) return null;
  try {
    return new URL(text);
  } catch {
    try {
      return new URL(`https://${text}`);
    } catch {
      return null;
    }
  }
}

function safeDecode(text: string) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

const DEFAULT_PORTS: Record<string, string> = { "http:": "80", "https:": "443", "ftp:": "21", "ws:": "80", "wss:": "443" };

export default function UrlParser() {
  const [input, setInput] = useState(
    "https://user:pass@example.com:8080/path/to/page.html?utm_source=newsletter&q=hello%20world&tags=a&tags=b#section-2",
  );
  const url = parse(input);
  const params = url ? [...url.searchParams.entries()] : [];

  const updateParams = (next: [string, string][]) => {
    if (!url) return;
    const copy = new URL(url);
    copy.search = new URLSearchParams(next).toString();
    setInput(copy.toString());
  };

  return (
    <ToolCard>
      <Field label="URL" htmlFor="url-input">
        <div className="flex gap-2">
          <Input
            id="url-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/page?id=42"
            className="font-mono"
          />
          <CopyButton value={input} />
        </div>
      </Field>

      {!url ? (
        input.trim() && <p className="text-sm text-destructive">That doesn&apos;t look like a valid URL.</p>
      ) : (
        <>
          <DetailGrid>
            <Detail label="Protocol" value={url.protocol.replace(":", "")} mono />
            <Detail label="Host" value={url.hostname} mono />
            <Detail label="Port" value={url.port || (DEFAULT_PORTS[url.protocol] ? `${DEFAULT_PORTS[url.protocol]} (default)` : "")} mono />
            <Detail label="Path" value={safeDecode(url.pathname)} mono />
            <Detail label="Fragment" value={url.hash ? safeDecode(url.hash.slice(1)) : ""} mono />
            <Detail label="Origin" value={url.origin} mono />
            {(url.username || url.password) && (
              <>
                <Detail label="Username" value={safeDecode(url.username)} mono />
                <Detail label="Password" value={safeDecode(url.password)} mono />
              </>
            )}
          </DetailGrid>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Query parameters ({params.length})</h2>
              <Button variant="outline" size="sm" onClick={() => updateParams([...params, ["", ""]])}>
                <Plus /> Add
              </Button>
            </div>
            {params.length === 0 ? (
              <p className="text-sm text-muted-foreground">This URL has no query string.</p>
            ) : (
              <div className="space-y-2">
                {params.map(([key, value], i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                    <Input
                      aria-label="Parameter name"
                      value={key}
                      onChange={(e) => updateParams(params.map((p, j) => (j === i ? [e.target.value, p[1]] : p)))}
                      className="font-mono"
                    />
                    <Input
                      aria-label="Parameter value"
                      value={value}
                      onChange={(e) => updateParams(params.map((p, j) => (j === i ? [p[0], e.target.value] : p)))}
                      className="font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${key}`}
                      onClick={() => updateParams(params.filter((_, j) => j !== i))}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Values are shown decoded. Editing them updates the URL above.
            </p>
          </div>
        </>
      )}
    </ToolCard>
  );
}
