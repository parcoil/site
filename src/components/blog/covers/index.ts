import type { ComponentType } from "react";
import SparkleCover from "./SparkleCover";

const coverComponents: Record<string, ComponentType> = {
  sparkle: SparkleCover,
};

export function getCoverComponent(name: string): ComponentType | null {
  return coverComponents[name] ?? null;
}
