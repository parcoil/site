/**
 * Fujitsu-Siemens BIOS families. The challenge the firmware shows comes in
 * several shapes — 8 or 5x4 hexadecimal digits, 5x4 decimal (two generations),
 * 6x4 decimal, and the newer 6x4 "203c-d001" hex code. Each shape has its own
 * documented transform (Dogbert's research; the 203c variant follows
 * polloloco's fujitsu-bios-unlocker). Re-expressed here from those descriptions.
 */

/* eslint-disable no-bitwise */
import { CRC16_CCITT_TABLE, crc32 } from "../crypto";
import { defineGenerator, type BiosGenerator } from "../generator";

const toBase36 = (byte: number): string => (byte % 36).toString(36);

/** Rotate an 8-bit value left by `n` bits (n === 8 leaves it unchanged). */
const rol8 = (value: number, n: number): number => ((value << n) & 0xff) | (value >> (8 - n));

// --- 8 / 5x4 hexadecimal ----------------------------------------------------

function hexHash(word: string): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    const d = CRC16_CCITT_TABLE[(word.charCodeAt(i) ^ (hash >> 8)) % 256];
    hash = ((hash << 8) ^ d) & 0xffff;
  }
  return hash;
}

function hexHashToDigits(hash: number): string {
  return [12, 8, 4, 0].map((shift) => String(((hash >> shift) % 16) % 10)).join("");
}

function fsiHexKeygen(serial: string): string {
  const code = serial.length === 20 ? serial.slice(12, 20) : serial;
  return hexHashToDigits(hexHash(code.slice(0, 4))) + hexHashToDigits(hexHash(code.slice(4, 8)));
}

// --- shared decimal unpacking ----------------------------------------------

/** Split a 20-digit decimal string into 8 bytes (four little-endian 16-bit words). */
function decimalToBytes(code: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < 20; i += 5) {
    const value = parseInt(code.slice(i, i + 5), 10);
    bytes.push(value % 256, Math.floor(value / 256));
  }
  return bytes;
}

// --- 5x4 decimal (old) ------------------------------------------------------

function fsi20DecOldKeygen(serial: string): string {
  const XOR_KEY = ":3-v@e4i";

  const interleave = (src: number[], dst: number[], from: number[]): number[] => {
    const out = src.slice();
    out[dst[0]] = ((src[from[0]] >> 4) | (src[from[3]] << 4)) & 0xff;
    out[dst[1]] = (src[from[0]] & 0x0f) | (src[from[3]] & 0xf0);
    out[dst[2]] = (src[from[1]] >> 4) | ((src[from[2]] << 4) & 0xff);
    out[dst[3]] = (src[from[1]] & 0x0f) | (src[from[2]] & 0xf0);
    return out;
  };

  let bytes = decimalToBytes(serial).map((b, i) => b ^ XOR_KEY.charCodeAt(i));
  [bytes[2], bytes[6]] = [bytes[6], bytes[2]];
  [bytes[3], bytes[7]] = [bytes[7], bytes[3]];
  bytes = interleave(bytes, [0, 1, 2, 3], [0, 1, 2, 3]);
  bytes = interleave(bytes, [4, 5, 6, 7], [6, 7, 4, 5]);

  const SHIFTS: Record<number, number> = { 0: 3, 1: 5, 2: 7, 3: 4, 5: 6, 6: 1, 7: 2 };
  for (const [index, shift] of Object.entries(SHIFTS)) bytes[+index] = rol8(bytes[+index], shift);
  return bytes.map(toBase36).join("");
}

// --- 6x4 decimal ------------------------------------------------------------

function fsi24DecKeygen(serial: string): string {
  const XOR_KEY = "<7#&9?>s";
  const t = decimalToBytes(serial.slice(4));
  const bytes = [
    (t[3] & 0xf0) | (t[0] & 0x0f),
    (t[2] & 0xf0) | (t[1] & 0x0f),
    (t[5] & 0xf0) | (t[6] & 0x0f),
    (t[4] & 0xf0) | (t[7] & 0x0f),
    (t[7] & 0xf0) | (t[4] & 0x0f),
    (t[6] & 0xf0) | (t[5] & 0x0f),
    (t[1] & 0xf0) | (t[2] & 0x0f),
    (t[0] & 0xf0) | (t[3] & 0x0f),
  ].map((b, i) => b ^ XOR_KEY.charCodeAt(i));

  const SHIFTS = [1, 7, 2, 8, 3, 6, 4, 5];
  return bytes.map((b, i) => toBase36(rol8(b, SHIFTS[i]))).join("");
}

// --- 5x4 decimal (new) ------------------------------------------------------

function fsi20DecNewKeygen(serial: string): string {
  const KEYS = [
    "4798156302", "7201593846", "5412367098", "6587249310",
    "9137605284", "3974018625", "8052974163",
  ];
  return [0, 2, 5, 11, 13, 15, 16]
    .map((position, i) => KEYS[i].charAt(parseInt(serial.charAt(position), 10)))
    .join("");
}

// --- 6x4 hexadecimal, 203c-d001 prefix --------------------------------------

function fsi203cKeygen(serial: string): string[] {
  const code = serial.toLowerCase();
  if (code.length !== 24 || code.slice(0, 8) !== "203cd001") return [];
  const payload = [...code.slice(8)].map((c) => c.charCodeAt(0));
  // JAMCRC is the bitwise complement of the standard CRC-32.
  return [((~crc32(payload)) >>> 0).toString(16).padStart(8, "0")];
}

// --- generators -------------------------------------------------------------

const toUpper = (raw: string): string => raw.trim().replace(/[\s-]/g, "").toUpperCase();

export const fsiHexGenerator: BiosGenerator = defineGenerator({
  id: "fsi-hex",
  vendor: "Fujitsu-Siemens",
  label: "Fujitsu-Siemens (hexadecimal)",
  description: "8 or 5x4 hexadecimal digits, e.g. DEADBEEF or AAAA-BBBB-CCCC-DEAD-BEEF.",
  examples: ["DEADBEEF", "AAAA-BBBB-CCCC-DEAD-BEEF"],
  normalize: toUpper,
  matches: (code) => /^([0-9A-F]{8}|[0-9A-F]{20})$/.test(code),
  generate: (code) => [fsiHexKeygen(code)],
});

export const fsiDecNewGenerator: BiosGenerator = defineGenerator({
  id: "fsi-dec-new",
  vendor: "Fujitsu-Siemens",
  label: "Fujitsu-Siemens (5x4 decimal, new)",
  description: "20 decimal digits as 5x4 groups (newer firmware).",
  examples: ["1234-4321-1234-4321-1234"],
  matches: (code) => /^\d{20}$/.test(code),
  generate: (code) => [fsi20DecNewKeygen(code)],
});

export const fsiDecOldGenerator: BiosGenerator = defineGenerator({
  id: "fsi-dec-old",
  vendor: "Fujitsu-Siemens",
  label: "Fujitsu-Siemens (5x4 decimal, old)",
  description: "20 decimal digits as 5x4 groups (older firmware).",
  examples: ["1234-4321-1234-4321-1234"],
  matches: (code) => /^\d{20}$/.test(code),
  generate: (code) => [fsi20DecOldKeygen(code)],
});

export const fsiDec24Generator: BiosGenerator = defineGenerator({
  id: "fsi-dec-24",
  vendor: "Fujitsu-Siemens",
  label: "Fujitsu-Siemens (6x4 decimal)",
  description: "Four hex digits followed by 20 decimal digits (6x4 layout).",
  examples: ["8F16-1234-4321-1234-4321-1234"],
  normalize: toUpper,
  matches: (code) => /^[0-9A-F]{4}\d{20}$/.test(code),
  generate: (code) => [fsi24DecKeygen(code)],
});

export const fsiHex203cGenerator: BiosGenerator = defineGenerator({
  id: "fsi-hex-203c",
  vendor: "Fujitsu-Siemens",
  label: "Fujitsu-Siemens (203c-d001 hex)",
  description: "6x4 hexadecimal code beginning 203c-d001.",
  examples: ["203c-d001-0000-001d-e960-227d"],
  matches: (code) => /^[0-9A-Fa-f]{24}$/.test(code) && code.toLowerCase().startsWith("203cd001"),
  generate: (code) => fsi203cKeygen(code),
});
