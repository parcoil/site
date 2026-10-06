/*
 * Dell BIOS master-password generators.
 *
 * Ported, largely verbatim, from bacher09/pwgen-for-bios
 * (https://github.com/bacher09/pwgen-for-bios), which is licensed GPL-3.0.
 * This whole directory is therefore GPL-3.0 — see ./LICENSE. Original research
 * by Dogbert, hpgl and asyncritius.
 *
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * Unlike the rest of src/lib/bios (a clean reimplementation from documented
 * algorithms), these Dell schemes exist only as this reverse-engineered code,
 * so they are kept isolated here under their upstream license. The TypeScript
 * `enum`s from upstream are expressed here as const objects + union types so
 * the module type-checks and runs under the project's toolchain unchanged.
 */

export const DellTag = {
  Tag595B: "595B",
  TagD35B: "D35B",
  Tag2A7B: "2A7B",
  TagA95B: "A95B",
  Tag1D3B: "1D3B",
  Tag6FF1: "6FF1",
  Tag1F66: "1F66",
  Tag1F5A: "1F5A",
  TagBF97: "BF97",
  TagE7A8: "E7A8",
} as const;

export type DellTag = (typeof DellTag)[keyof typeof DellTag];

export const SuffixType = {
  ServiceTag: 0,
  HDD: 1,
} as const;

export type SuffixType = (typeof SuffixType)[keyof typeof SuffixType];
