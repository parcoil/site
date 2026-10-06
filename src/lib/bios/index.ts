/**
 * BIOS/UEFI master-password recovery.
 *
 * This module reimplements publicly documented, reverse-engineered BIOS
 * password-generation algorithms so that the owner of a machine (or a
 * technician servicing one) can recover a forgotten supervisor/power-on
 * password locally. Everything runs in the browser/Node; no challenge, serial
 * number or generated password is ever sent anywhere.
 *
 * The algorithms are facts documented in Dogbert's "Table of reverse
 * engineered BIOS passwords" research and mirrored by the open-source
 * `bios-pw` / `pwgen-for-bios` projects. See ./README.md for attribution.
 */

import { asusGenerator } from "./generators/asus";
import { dellGenerators } from "./dell";
import {
  fsiDec24Generator,
  fsiDecNewGenerator,
  fsiDecOldGenerator,
  fsiHex203cGenerator,
  fsiHexGenerator,
} from "./generators/fsi";
import { hpAmiGenerator, hpMiniGenerator } from "./generators/hp";
import {
  acerInsyde10Generator,
  hpInsydeGenerator,
  insydeGenericGenerator,
} from "./generators/insyde";
import { phoenixGenerators } from "./generators/phoenix";
import { samsung44HexGenerator, samsungGenerator } from "./generators/samsung";
import { sony4x4Generator, sonyOldGenerator } from "./generators/sony";
import type { BiosGenerator } from "./generator";

export type { BiosGenerator } from "./generator";

/** Every registered generator, ordered roughly from most to least specific. */
export const generators: BiosGenerator[] = [
  asusGenerator,
  acerInsyde10Generator,
  sonyOldGenerator,
  sony4x4Generator,
  samsung44HexGenerator,
  samsungGenerator,
  ...dellGenerators,
  fsiHexGenerator,
  fsiDecNewGenerator,
  fsiDecOldGenerator,
  fsiDec24Generator,
  fsiHex203cGenerator,
  hpMiniGenerator,
  hpInsydeGenerator,
  hpAmiGenerator,
  insydeGenericGenerator,
  ...phoenixGenerators,
];

export interface RecoveryResult {
  generator: BiosGenerator;
  /** The normalised challenge this generator was run against. */
  challenge: string;
  /** Candidate passwords; any one of them should unlock the machine. */
  passwords: string[];
}

/**
 * Return the generators whose format this challenge matches. A single
 * challenge can legitimately match several families (e.g. an 8-digit code
 * looks like both an ASUS date and an Insyde challenge), so all are returned.
 */
export function detect(rawChallenge: string): BiosGenerator[] {
  return generators.filter((gen) => gen.matches(gen.normalize(rawChallenge)));
}

/**
 * Run every compatible generator against the challenge and return the labelled
 * results that actually produced at least one candidate password.
 */
export function recover(rawChallenge: string): RecoveryResult[] {
  const results: RecoveryResult[] = [];
  for (const generator of generators) {
    const challenge = generator.normalize(rawChallenge);
    if (!generator.matches(challenge)) continue;
    const passwords = generator.generate(challenge);
    if (passwords.length > 0) {
      results.push({ generator, challenge, passwords });
    }
  }
  return results;
}
