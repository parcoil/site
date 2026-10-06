/**
 * Sony BIOS families:
 *  - Old Sony: a 7-digit serial mapped digit-by-digit through a fixed table.
 *  - Sony 4x4: a 16-character code that is an RSA-encrypted password; the
 *    (small, long-broken) private key is recovered by factoring the modulus.
 * Both schemes were documented by Dogbert (`pwgen-sony-4x4.py`).
 */

/* eslint-disable no-bitwise */
import { defineGenerator, type BiosGenerator } from "../generator";

// --- old Sony ---------------------------------------------------------------

function sonyOldKeygen(serial: string): string {
  const table = "0987654321876543210976543210982109876543109876543221098765436543210987";
  let code = "";
  for (let i = 0; i < serial.length; i++) {
    code += table.charAt(parseInt(serial.charAt(i), 10) + 10 * i);
  }
  return code;
}

export const sonyOldGenerator: BiosGenerator = defineGenerator({
  id: "sony-old",
  vendor: "Sony",
  label: "Sony (7-digit serial)",
  description: "7-digit serial shown by older Sony machines, e.g. 1234567.",
  examples: ["1234567"],
  matches: (code) => /^\d{7}$/.test(code),
  generate: (code) => [sonyOldKeygen(code)],
});

// --- Sony 4x4 ---------------------------------------------------------------

const OTP_CHARS = "9DPK7V2F3RT6HX8J";
const PWD_CHARS = "47592836";

// `BigInt(...)` rather than `1n` literals, to type-check under the ES2017 target.
const B0 = BigInt(0);
const B1 = BigInt(1);
const B8 = BigInt(8);

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = B1;
  base %= mod;
  while (exp > B0) {
    if (exp & B1) result = (result * base) % mod;
    exp >>= B1;
    base = (base * base) % mod;
  }
  return result;
}

function modInverse(a: bigint, m: bigint): bigint {
  let [oldR, r] = [a, m];
  let [oldS, s] = [B1, B0];
  while (r !== B0) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % m) + m) % m;
}

/** Decode 16 OTP characters into a little-endian 64-bit ciphertext. */
function decodeChallenge(code: string): bigint {
  const bytes: number[] = [];
  for (let i = 0; i < code.length; i += 2) {
    bytes.unshift(OTP_CHARS.indexOf(code[i]) * 16 + OTP_CHARS.indexOf(code[i + 1]));
  }
  let value = B0;
  for (let i = 7; i >= 0; i--) value = (value << B8) | BigInt(bytes[i]);
  return value;
}

function encodePassword(low32: number): string {
  let out = "";
  for (let i = 0; i < 8; i++) out += PWD_CHARS.charAt((low32 >> (21 - i * 3)) & 0x7);
  return out;
}

function sony4x4Keygen(code: string): string {
  // The firmware's RSA modulus factors into these two primes.
  const p = BigInt(2795287379);
  const q = BigInt(3544934711);
  const e = BigInt(41);
  const n = p * q;
  const d = modInverse(e, (p - B1) * (q - B1));

  const cipher = decodeChallenge(code);
  const plain = modPow(cipher, d, n);
  return encodePassword(Number(plain & BigInt(0xffffffff)) >>> 0);
}

export const sony4x4Generator: BiosGenerator = defineGenerator({
  id: "sony-4x4",
  vendor: "Sony",
  label: "Sony 4x4",
  description: "16-character 4x4 code, e.g. 73KR-3FP9-PVKH-K29R.",
  examples: ["73KR-3FP9-PVKH-K29R"],
  normalize: (raw) => raw.trim().replace(/[\s-]/g, "").toUpperCase(),
  matches: (code) => new RegExp(`^[${OTP_CHARS}]{16}$`).test(code),
  generate: (code) => [sony4x4Keygen(code)],
});
