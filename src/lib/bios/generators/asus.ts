/**
 * ASUS laptops derive their BIOS master password from the BIOS build date.
 * The challenge a user supplies is therefore a date, which the BIOS shows, and
 * the password is a fixed function of it. Algorithm reverse-engineered by
 * Dogbert (`pwgen-asus.py`); re-expressed here from that description.
 */

/* eslint-disable no-bitwise */
import { defineGenerator, type BiosGenerator } from "../generator";

const ZERO = "0".charCodeAt(0);

/** Greatest common divisor (iterative Euclid). */
function gcd(a: number, b: number): number {
  while (b > 0) [a, b] = [b, a % b];
  return a;
}

/** Smallest multiplier `>= 2` reached after `steps` coprimality bumps. */
function coprimeStep(value: number, steps: number): number {
  let candidate = 2;
  for (let i = 0; i < steps; i++) {
    if (gcd(value, candidate) !== 1) candidate++;
  }
  return candidate;
}

/** Modular exponentiation `base ** exp mod modulus`. */
function modPow(base: number, exp: number, modulus: number): number {
  base %= modulus;
  let result = base;
  for (let i = 1; i < exp; i++) result = (base * result) % modulus;
  return exp === 0 ? 1 : result;
}

/** Build the 32-entry substitution table used to turn the date into a password. */
function buildTable(seedA = 11, seedB = 19, seedC = 6): number[] {
  const table = [seedA + ZERO, seedB + ZERO, seedC + ZERO, ...[6, 7, 8, 9].map((d) => d + ZERO)];

  let checksum = table.reduce((acc, value) => acc + value, 0);
  for (let i = 7; i < 32; i++) {
    checksum = (33676 * checksum + 12345) >>> 0;
    table[i] = (((checksum >> 16) & 0x7fff) % 43) + ZERO;
  }

  const modulus = seedA * seedB;
  const exponent = coprimeStep((seedA - 1) * (seedB - 1), seedC);
  return table.map((value) => modPow(value - ZERO, exponent, modulus));
}

const TABLE = buildTable();

/** Compute the ASUS BIOS password for a given calendar date. */
export function asusKeygen(year: number, month: number, day: number): string {
  const date =
    String(year).padStart(4, "0") + String(month).padStart(2, "0") + String(day).padStart(2, "0");

  // The firmware parses the decimal date string as if it were hexadecimal.
  let checksum = parseInt(date, 16);
  let password = "";
  for (let i = 0; i < 8; i++) {
    checksum = (33676 * checksum + 12345) >>> 0;
    const value = TABLE[(checksum >> 16) & 31] % 36;
    password += String.fromCharCode(value > 9 ? value + "7".charCodeAt(0) : value + ZERO);
  }
  return password;
}

function validDate(year: number, month: number, day: number): boolean {
  return year >= 1990 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

export const asusGenerator: BiosGenerator = defineGenerator({
  id: "asus-date",
  vendor: "ASUS",
  label: "ASUS (BIOS date)",
  description: "Eight digits taken from the BIOS build date, e.g. 2010-02-03 or 03-02-2010.",
  examples: ["2010-02-03", "01-02-2007"],
  matches: (code) => /^\d{8}$/.test(code),
  generate: (code) => {
    const results: string[] = [];
    const ymd: [number, number, number] = [
      +code.slice(0, 4),
      +code.slice(4, 6),
      +code.slice(6, 8),
    ];
    const dmy: [number, number, number] = [
      +code.slice(4, 8),
      +code.slice(2, 4),
      +code.slice(0, 2),
    ];
    if (validDate(...ymd)) results.push(asusKeygen(...ymd));
    if (validDate(...dmy)) results.push(asusKeygen(...dmy));
    return results;
  },
});
