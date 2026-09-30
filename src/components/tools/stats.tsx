import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>{children}</div>
  );
}

/** Big number with a caption. */
export function Stat({
  label,
  value,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-muted/30 p-4 text-center", className)}>
      <div className="text-2xl font-bold text-primary tabular-nums wrap-break-word">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function DetailGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3", className)}>
      {children}
    </div>
  );
}

/** Small uppercase label above a value, e.g. "ISP / Comcast". */
export function Detail({
  label,
  value,
  mono = false,
  className,
}: {
  label: ReactNode;
  value?: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  const empty = value === undefined || value === null || value === "" || value === "N/A";
  return (
    <div className={cn("rounded-lg border border-border/60 bg-muted/30 px-3 py-2", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 text-sm font-medium wrap-break-word", mono && "font-mono")}>
        {empty ? "—" : value}
      </p>
    </div>
  );
}
