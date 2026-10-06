/**
 * Insyde H2O BIOS families (Acer, HP and others):
 *  - Generic: 8-digit challenge XORed byte-for-byte against fixed salts.
 *  - HP "i" codes: an 8-digit challenge prefixed with `i`.
 *  - Acer 10-digit: SHA-256 of the challenge, a key schedule, one AES-128
 *    block and a CRC-64/ECMA of the result.
 * Documented by Dogbert; the Acer 10-digit scheme is from let-def's research.
 */

/* eslint-disable no-bitwise */
import { aes128EncryptBlock, crc64EcmaHex, sha256 } from "../crypto";
import { defineGenerator, type BiosGenerator } from "../generator";

const INSYDE_SALT = "Insyde Software Corp.";

// --- generic 8-digit --------------------------------------------------------

function insydeGenericKeygen(serial: string): string[] {
  const salt2 = ":\x16@>\x1496H\x07.\x0f\x0e\nG-MDGHBT";
  // Some firmware converts the challenge with snprintf("%d"), dropping leading
  // zeros and null-padding the tail — reproduce that buggy form too.
  const buggy = (parseInt(serial, 10).toString() + "\x00".repeat(8)).slice(0, 8);

  let p1 = "";
  let p2 = "";
  let p3 = "";
  for (let i = 0; i < 8; i++) {
    p1 += ((INSYDE_SALT.charCodeAt(i) + i) ^ serial.charCodeAt(i)) % 10;
    p2 += ((INSYDE_SALT.charCodeAt(i) + i) ^ buggy.charCodeAt(i)) % 10;
    p3 += (salt2.charCodeAt(i) ^ buggy.charCodeAt(i)) % 10;
  }
  return p1 === p2 ? [p1, p3] : [p1, p2, p3];
}

export const insydeGenericGenerator: BiosGenerator = defineGenerator({
  id: "insyde-generic",
  vendor: "Insyde H2O",
  label: "Insyde H2O (generic)",
  description: "8-digit Insyde H2O challenge (Acer, HP and others).",
  examples: ["03133610"],
  matches: (code) => /^\d{8}$/.test(code),
  generate: insydeGenericKeygen,
});

// --- HP "i" prefixed --------------------------------------------------------

const HP_INSYDE_RE = /^i\s*(\d{8})$/i;

function hpInsydeKeygen(serial: string): string[] {
  const salt1 = "c6B|wS^8";
  let p1 = "";
  let p2 = "";
  for (let i = 0; i < 8; i++) {
    p1 += ((salt1.charCodeAt(i) + i) ^ serial.charCodeAt(i)) % 10;
    p2 += ((INSYDE_SALT.charCodeAt(i) + i) ^ serial.charCodeAt(i)) % 10;
  }
  return [p1, p2];
}

export const hpInsydeGenerator: BiosGenerator = defineGenerator({
  id: "hp-insyde",
  vendor: "HP",
  label: "HP Insyde H2O (\"i\" code)",
  description: "An 8-digit Insyde challenge prefixed with `i`, e.g. i 70412809.",
  examples: ["i 70412809", "I 59170869"],
  normalize: (raw) => raw.trim().replace(/\s+/g, ""),
  matches: (code) => HP_INSYDE_RE.test(code),
  generate: (code) => {
    const match = HP_INSYDE_RE.exec(code);
    return match ? hpInsydeKeygen(match[1]) : [];
  },
});

// --- Acer 10-digit ----------------------------------------------------------

function keySchedule(digest: Uint8Array): Uint8Array {
  const mixed = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    let acc = 0;
    for (let j = 0; j < 8; j++) acc += digest[((i >> 2) << 3) + j] * digest[j * 4 + (i & 3)];
    mixed[i] = acc & 0xff;
  }

  const variant = digest[8] % 6;
  const out = new Uint8Array(16);
  if (variant === 0) {
    let k = 0;
    for (let i = 3; i >= 0; i--) for (let j = 0; j < 16; j += 4) out[k++] = mixed[i + j];
  } else if (variant === 1) {
    let k = 0;
    for (let i = 0; i < 4; i++) for (let j = 12; j >= 0; j -= 4) out[k++] = mixed[i + j];
  } else if (variant === 2) {
    let k = 0;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out[k++] = (mixed[((j + i) & 3) + i * 4] + i) & 0xff;
  } else if (variant === 3) {
    let acc1 = 0;
    let acc2 = 0;
    for (let i = 0; i < 4; i++) {
      acc1 ^= mixed[i * 5];
      acc2 ^= mixed[i * 3 + 3];
    }
    for (let i = 0; i < 16; i++) out[i] = mixed[i] ^ (i % 2 === 0 ? acc1 : acc2);
  } else if (variant === 4) {
    for (let i = 0; i < 16; i++) {
      const a = mixed[i];
      const b = mixed[(i + 1) & 0xf];
      out[i] = a ^ (b < a ? b : 0xff);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      let acc = 0;
      for (let j = 0; j < 16; j += 4) acc ^= mixed[j + i];
      for (let j = 0; j < 16; j += 4) out[i + j] = (mixed[i + j] * acc) & 0xff;
    }
  }
  return out;
}

function acerInsyde10Keygen(serial: string): string[] {
  const input = Uint8Array.from([...serial].map((c) => c.charCodeAt(0) & 0xff));
  const digest = sha256(input);
  const key = keySchedule(digest);

  const step = (digest[9] & 0xf) * 2 + 1;
  const block = new Uint8Array(16);
  for (let i = 0; i < 16; i++) block[i] = digest[(step * i) % digest.length];

  const encrypted = aes128EncryptBlock(key, block);
  return [crc64EcmaHex(encrypted)];
}

export const acerInsyde10Generator: BiosGenerator = defineGenerator({
  id: "acer-insyde-10",
  vendor: "Acer (Insyde H2O)",
  label: "Acer Insyde H2O (10 digits)",
  description: "10-digit Insyde H2O challenge used by newer Acer machines.",
  examples: ["0173549286"],
  matches: (code) => /^\d{10}$/.test(code),
  generate: acerInsyde10Keygen,
});
