import Link from "next/link";
import { conversionToolList, toolHref } from "@/lib/tools";
import { cn } from "@/lib/utils";

/** Chips linking to every /tools/convert/* landing page. */
export default function ConversionLinks({
  currentSlug,
  className,
}: {
  currentSlug?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {conversionToolList.map((tool) => (
        <Link
          key={tool.slug}
          href={toolHref(tool)}
          aria-current={tool.slug === currentSlug ? "page" : undefined}
          className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-primary"
        >
          {tool.name.replace(" Converter", "")}
        </Link>
      ))}
    </div>
  );
}
