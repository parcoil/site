import Link from "next/link";
import { type Tool, toolHref } from "@/lib/tools";
import { cn } from "@/lib/utils";

export default function ToolLink({ tool, className }: { tool: Tool; className?: string }) {
  const Icon = tool.icon;
  return (
    <Link
      href={toolHref(tool)}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors",
        className,
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-medium">{tool.name}</h3>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}
