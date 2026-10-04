"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ConversionLinks from "@/components/tools/ConversionLinks";
import ToolLink from "@/components/tools/ToolLink";
import { TOOL_CATEGORIES, getCategory, listedTools, tools, type Tool } from "@/lib/tools";

function matches(tool: Tool, terms: string[]) {
  const haystack = [
    tool.name,
    tool.description,
    getCategory(tool.category).name,
    ...tool.keywords,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

const grid = "grid sm:grid-cols-2 lg:grid-cols-3 gap-4";

export default function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const results = useMemo(
    () => (terms.length ? tools.filter((tool) => matches(tool, terms)) : []),
    [terms],
  );

  return (
    <div>
      <div className="relative max-w-xl mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${listedTools.length} tools…`}
          aria-label="Search tools"
          className="pl-9 h-11"
        />
      </div>

      {terms.length > 0 ? (
        results.length > 0 ? (
          <div className={grid}>
            {results.map((tool) => (
              <ToolLink key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No tools match &ldquo;{query}&rdquo;.
          </p>
        )
      ) : (
        <>
          <nav aria-label="Tool categories" className="flex flex-wrap justify-center gap-2 mb-10">
            {TOOL_CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {category.name}
              </a>
            ))}
          </nav>

          {TOOL_CATEGORIES.map((category) => {
            const categoryTools = listedTools.filter((t) => t.category === category.id);
            if (categoryTools.length === 0) return null;
            return (
              <section key={category.id} id={category.id} className="scroll-mt-24 mb-12">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className={grid}>
                  {categoryTools.map((tool) => (
                    <ToolLink key={tool.slug} tool={tool} />
                  ))}
                </div>
                {category.id === "media" && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Popular image conversions</h3>
                    <ConversionLinks />
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
