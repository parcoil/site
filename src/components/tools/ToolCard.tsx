import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** The panel every tool's interactive UI sits in. */
export default function ToolCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("w-full mx-auto", className)}>
      <CardContent className="p-4 sm:p-6 space-y-6">{children}</CardContent>
    </Card>
  );
}
