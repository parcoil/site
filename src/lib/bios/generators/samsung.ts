/**
 * Samsung BIOS families. The challenge is a hexadecimal string; the password
 * bytes are recovered by rotating each hash byte by an amount taken from a
 * fixed rotation matrix selected by a key byte. Two layouts exist: the shorter
 * 12-18 digit form and the 44-digit form. Documented by Dogbert.
 */

/* eslint-disable no-bitwise */
import { defineGenerator, type BiosGenerator } from "../generator";
import { scanCodesToText } from "../scancodes";

// Rotation amounts selected by the key byte (7 per key, 5 keys).
const ROTATION_1 = [
  7, 1, 5, 3, 0, 6, 2, 5, 2, 3, 0, 6, 1, 7, 6, 1, 5, 2, 7, 1, 0, 3, 7,
  6, 1, 0, 5, 2, 1, 5, 7, 3, 2, 0, 6,
];
const ROTATION_2 = [
  1, 6, 2, 5, 7, 3, 0, 7, 1, 6, 2, 5, 0, 3, 0, 6, 5, 1, 1, 7, 2, 5, 2,
  3, 7, 6, 2, 1, 3, 7, 6, 5, 0, 1, 7,
];
// 20 per key, 5 keys, for the 44-digit variant.
const ROTATION_3 = [
  3, 6, 3, 1, 6, 7, 7, 7, 2, 6, 4, 3, 4, 6, 1, 7, 2, 1, 7, 7,
  5, 3, 3, 1, 2, 3, 1, 2, 1, 7, 4, 7, 6, 2, 4, 4, 1, 6, 1, 5,
  6, 6, 7, 5, 7, 7, 4, 3, 1, 1, 1, 6, 3, 2, 7, 3, 7, 3, 7, 3,
  5, 6, 4, 1, 1, 3, 6, 6, 1, 4, 3, 7, 6, 7, 5, 3, 6, 7, 6, 3,
  1, 3, 5, 7, 5, 6, 2, 2, 7, 5, 7, 1, 2, 3, 2, 1, 6, 4, 5, 3,
];

const byteRol = (value: number, shift: number): number =>
  ((value << shift) & 0xff) | (value >> (8 - shift));

const isPrintable = (sym: number): boolean => sym >= 32 && sym < 127;

/** Decode a run of bytes to printable ASCII, or undefined if any byte isn't. */
function bytesToAscii(bytes: readonly number[]): string | undefined {
  let out = "";
  for (const byte of bytes) {
    if (byte === 0) return out;
    if (!isPrintable(byte)) return undefined;
    out += String.fromCharCode(byte);
  }
  return out;
}

// --- 12-18 hex --------------------------------------------------------------

function samsungKeygen(serial: string): string[] {
  const hash: number[] = [];
  for (let i = 1; i < Math.floor(serial.length / 2); i++) {
    hash.push(parseInt(serial.slice(2 * i, 2 * i + 2), 16));
  }
  const key = parseInt(serial.slice(0, 2), 16) % 5;

  const rotate = (matrix: number[]): number[] =>
    hash.map((byte, i) => byteRol(byte, matrix[7 * key + i]));

  let scanCodePassword = scanCodesToText(rotate(ROTATION_1));
  if (scanCodePassword === "") scanCodePassword = scanCodesToText(rotate(ROTATION_2));

  const candidates = [
    scanCodePassword,
    bytesToAscii(rotate(ROTATION_1)),
    bytesToAscii(rotate(ROTATION_2)),
  ];
  return candidates.filter((code): code is string => Boolean(code));
}

export const samsungGenerator: BiosGenerator = defineGenerator({
  id: "samsung",
  vendor: "Samsung",
  label: "Samsung (12-18 hex)",
  description: "12, 14, 16 or 18 hexadecimal digits, e.g. 07088120410C0000.",
  examples: ["07088120410C0000"],
  normalize: (raw) => raw.trim().replace(/[\s-]/g, "").toUpperCase(),
  matches: (code) => /^[0-9A-F]+$/.test(code) && [12, 14, 16, 18].includes(code.length),
  generate: samsungKeygen,
});

// --- 44 hex -----------------------------------------------------------------

function samsung44HexKeygen(serial: string): string | undefined {
  if (serial.length !== 44) return undefined;

  const hash = new Uint8Array(22);
  for (let i = 21; i >= 0; i--) {
    const low = parseInt(serial[i * 2], 16);
    const high = parseInt(serial[i * 2 + 1], 16);
    hash[21 - i] = (high << 4) | low;
  }

  const pwdLength = hash[0] >> 3;
  if (pwdLength > 20) return undefined;

  const key = (hash[1] % 5) * 20;
  let password = "";
  for (let i = 0; i < pwdLength; i++) {
    const sym = byteRol(byteRol(hash[i + 2], ROTATION_3[key + i]), 4);
    if (!isPrintable(sym)) return undefined;
    password += String.fromCharCode(sym);
  }
  return password;
}

export const samsung44HexGenerator: BiosGenerator = defineGenerator({
  id: "samsung-44hex",
  vendor: "Samsung",
  label: "Samsung (44 hex)",
  description: "44 hexadecimal digits.",
  examples: ["54574AAD6A8B1B9353F6FA66DCD2DA91B06DBD8E3204"],
  normalize: (raw) => raw.trim().replace(/[\s-]/g, "").toUpperCase(),
  matches: (code) => /^[0-9A-F]{44}$/.test(code),
  generate: (code) => {
    const pwd = samsung44HexKeygen(code);
    return pwd ? [pwd] : [];
  },
});
