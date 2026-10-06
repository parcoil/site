/**
 * Hewlett-Packard BIOS families:
 *  - HP/Compaq Mini netbooks: a 10-character code mapped through a fixed
 *    substitution table. Two tables differ in one entry, so two candidate
 *    passwords are produced when they disagree.
 *  - HP (AMI BIOS): an 8 hex-digit "A code" turned into a password with two
 *    salted CRC-32 passes.
 * Both algorithms are documented in Dogbert's research.
 */

/* eslint-disable no-bitwise */
import { crc32, crc32Hex } from "../crypto";
import { defineGenerator, type BiosGenerator } from "../generator";

// --- HP / Compaq Mini -------------------------------------------------------

const MINI_TABLE_A: Readonly<Record<string, string>> = {
  "0": "1", "1": "3", "2": "7", "3": "F", "4": "V", "5": "Q", "6": "G", "7": "X",
  "8": "U", "9": "O", a: "C", b: "P", c: "E", d: "T", e: "M", f: "8", g: "H",
  h: "Z", i: "Y", j: "W", k: "S", l: "K", m: "4", n: "9", o: "J", p: "2",
  q: "5", r: "B", s: "N", t: "A", u: "L", v: "6", w: "D", x: "4", y: "I", z: "0",
};

// The second table agrees with the first except for the letter "x".
const MINI_TABLE_B: Readonly<Record<string, string>> = { ...MINI_TABLE_A, x: "R" };

function hpMiniKeygen(serial: string): string[] {
  const lower = serial.toLowerCase();
  const a = [...lower].map((c) => MINI_TABLE_A[c]).join("").toLowerCase();
  const b = [...lower].map((c) => MINI_TABLE_B[c]).join("").toLowerCase();
  return a === b ? [a] : [a, b];
}

export const hpMiniGenerator: BiosGenerator = defineGenerator({
  id: "hp-mini",
  vendor: "HP / Compaq",
  label: "HP / Compaq Mini netbooks",
  description: "10-character code shown by HP/Compaq Mini netbooks, e.g. CNU1234ABC.",
  examples: ["CNU1234ABC"],
  matches: (code) => /^[0-9A-Za-z]{10}$/.test(code),
  generate: hpMiniKeygen,
});

// --- HP AMI BIOS ------------------------------------------------------------

const AMI_SALT = Uint8Array.from([
  0xb9, 0xed, 0xf5, 0x69, 0x9d, 0x16, 0x49, 0xf9,
  0x8c, 0x5f, 0x7c, 0xb3, 0x68, 0x3c, 0xd4, 0xa7,
]);

/** Pack a 32-bit value into four little-endian bytes at `offset`. */
function putUint32LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
}

function hpAmiKeygen(input: string): string {
  const backdoor = parseInt(input, 16);
  const block = new Uint8Array(20);

  for (let i = 0; i < 16; i++) block[i] = AMI_SALT[i] ^ 0x36;
  putUint32LE(block, 16, backdoor);
  const inner = crc32(block);

  for (let i = 0; i < 16; i++) block[i] = AMI_SALT[i] ^ 0x5c;
  putUint32LE(block, 16, inner);
  return crc32Hex(block);
}

export const hpAmiGenerator: BiosGenerator = defineGenerator({
  id: "hp-ami",
  vendor: "HP",
  label: "HP (AMI BIOS)",
  description: "8 hexadecimal digits (AMI \"A code\"), e.g. A7AF422F.",
  examples: ["A7AF422F"],
  normalize: (raw) => raw.trim().replace(/[\s-]/g, "").toUpperCase(),
  matches: (code) => /^[0-9A-F]{8}$/.test(code),
  generate: (code) => [hpAmiKeygen(code)],
});
