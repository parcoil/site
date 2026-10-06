/*
 * Dell BIOS master-password generators — BiosGenerator wrappers.
 *
 * Adapts the ported Dell keygen (./keygen.ts, ./encode.ts, ./latitude.ts) to
 * this project's `BiosGenerator` interface. This directory is GPL-3.0 as a
 * whole (see ./LICENSE) because the Dell algorithms it depends on are a port of
 * GPL-3.0 code, not a clean reimplementation.
 *
 * SPDX-License-Identifier: GPL-3.0-only
 */
import { defineGenerator, type BiosGenerator } from "../generator";
import { isDellTag, keygenDell, keygenHddOld } from "./keygen";
import { latitude3540Keygen } from "./latitude";
import { DellTag, SuffixType } from "./types";

const stripUpper = (raw: string): string => raw.trim().replace(/[\s-]/g, "").toUpperCase();

/** Dell service tag + 4-char suffix, e.g. 1234567-595B. */
export const dellServiceTagGenerator: BiosGenerator = defineGenerator({
  id: "dell-service-tag",
  vendor: "Dell",
  label: "Dell (service tag)",
  description: "7-character service tag plus a 4-character suffix, e.g. 1234567-595B.",
  examples: ["1234567-595B", "1234567-1D3B"],
  normalize: stripUpper,
  matches: (code) => code.length === 11 && isDellTag(code.slice(7, 11)),
  generate: (code) =>
    keygenDell(code.slice(0, 7), code.slice(7, 11) as DellTag, SuffixType.ServiceTag),
});

/** Dell HDD serial + 4-char suffix, e.g. 1234567890A-595B. */
export const dellHddGenerator: BiosGenerator = defineGenerator({
  id: "dell-hdd",
  vendor: "Dell",
  label: "Dell (HDD serial)",
  description: "11-character HDD serial plus a 4-character suffix, e.g. 1234567890A-595B.",
  examples: ["1234567890A-595B"],
  normalize: stripUpper,
  matches: (code) => code.length === 15 && isDellTag(code.slice(11, 15)),
  generate: (code) =>
    keygenDell(code.slice(0, 11), code.slice(11, 15) as DellTag, SuffixType.HDD),
});

/** Older Dell HDD scheme — an 11-character serial with no suffix. */
export const dellHddOldGenerator: BiosGenerator = defineGenerator({
  id: "dell-hdd-old",
  vendor: "Dell",
  label: "Dell (HDD serial, old)",
  description: "11-character HDD serial on older Dell firmware.",
  examples: ["12345678901"],
  normalize: stripUpper,
  matches: (code) => code.length === 11,
  generate: (code) => [keygenHddOld(code)],
});

/** Dell Latitude 3540 (Insyde): 16-hex challenge + 7-char service tag. */
const LATITUDE_RE = /^([0-9A-F]{16})([0-9A-Z]{7})$/;

export const dellLatitude3540Generator: BiosGenerator = defineGenerator({
  id: "dell-latitude-3540",
  vendor: "Dell",
  label: "Dell Latitude 3540 (Insyde)",
  description: "16 hex digits plus a 7-character service tag, e.g. 5F3988D5E0ACE4BF-7QH8602.",
  examples: ["5F3988D5E0ACE4BF-7QH8602"],
  normalize: stripUpper,
  matches: (code) => LATITUDE_RE.test(code),
  generate: (code) => {
    const match = LATITUDE_RE.exec(code);
    if (!match) return [];
    const output = latitude3540Keygen(match[1], match[2]);
    return output ? [output] : [];
  },
});

/** All Dell generators, in the upstream order. */
export const dellGenerators: BiosGenerator[] = [
  dellHddOldGenerator,
  dellServiceTagGenerator,
  dellHddGenerator,
  dellLatitude3540Generator,
];
