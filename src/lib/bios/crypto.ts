/**
 * Standard, textbook cryptographic / checksum primitives used by the BIOS
 * recovery generators. None of these are vendor secrets: CRC-16/CCITT,
 * CRC-32/IEEE, CRC-64/ECMA, SHA-256 and AES-128 are all public specifications.
 * They live here so every generator shares one audited implementation.
 */

/* eslint-disable no-bitwise */

// ---------------------------------------------------------------------------
// CRC-16/CCITT (polynomial 0x1021, MSB-first, no reflection)
// ---------------------------------------------------------------------------

export const CRC16_CCITT_TABLE: readonly number[] = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc <<= 1;
      if (crc & 0x10000) crc ^= 0x1021;
    }
    table.push(crc & 0xffff);
  }
  return table;
})();

// ---------------------------------------------------------------------------
// CRC-32/IEEE (reflected, init 0xFFFFFFFF, final XOR 0xFFFFFFFF)
// ---------------------------------------------------------------------------

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

/** Standard CRC-32/IEEE over the input bytes, returned as an unsigned 32-bit int. */
export function crc32(bytes: Uint8Array | readonly number[]): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ (bytes[i] & 0xff)) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** CRC-32 as an 8-character, zero-padded hex string. */
export function crc32Hex(bytes: Uint8Array | readonly number[]): string {
  return crc32(bytes).toString(16).padStart(8, "0");
}

// ---------------------------------------------------------------------------
// CRC-64/ECMA-182 (reflected form, polynomial 0xC96C5795D7870F42)
// ---------------------------------------------------------------------------

// `BigInt(...)` is used instead of `1n`-style literals so the module type-checks
// under the project's ES2017 target; the values are ordinary BigInts at runtime.
const B0 = BigInt(0);
const B1 = BigInt(1);
const B8 = BigInt(8);
const BFF = BigInt(0xff);
const MASK64 = (B1 << BigInt(64)) - B1;

const CRC64_ECMA_TABLE: BigInt64Array = (() => {
  const poly = BigInt("0xc96c5795d7870f42");
  const table = new BigInt64Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = BigInt(i);
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & B1 ? (crc >> B1) ^ poly : crc >> B1;
    }
    table[i] = BigInt.asIntN(64, crc & MASK64);
  }
  return table;
})();

/** CRC-64/ECMA as a 16-character, zero-padded hex string. */
export function crc64EcmaHex(bytes: Uint8Array | readonly number[]): string {
  let crc = B0;
  for (let i = 0; i < bytes.length; i++) {
    const index = Number((crc ^ BigInt(bytes[i] & 0xff)) & BFF);
    crc = (BigInt.asUintN(64, CRC64_ECMA_TABLE[index]) ^ (crc >> B8)) & MASK64;
  }
  return crc.toString(16).padStart(16, "0");
}

// ---------------------------------------------------------------------------
// SHA-256 (FIPS 180-4)
// ---------------------------------------------------------------------------

const SHA256_K: readonly number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const rotr = (x: number, n: number): number => (x >>> n) | (x << (32 - n));

/** SHA-256 digest of the input, returned as 32 bytes. */
export function sha256(message: Uint8Array | readonly number[]): Uint8Array {
  const h = Int32Array.from([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  const bitLen = BigInt(message.length) * B8;
  const padded = new Uint8Array((Math.floor((message.length + 8) / 64) + 1) * 64);
  padded.set(message);
  padded[message.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setBigUint64(padded.length - 8, bitLen);

  const w = new Int32Array(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getInt32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) outView.setInt32(i * 4, h[i]);
  return out;
}

// ---------------------------------------------------------------------------
// AES-128 (FIPS 197) — single-block encryption, enough for the Insyde keygen
// ---------------------------------------------------------------------------

const AES_SBOX: Uint8Array = Uint8Array.from([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]);

const AES_RCON: Uint8Array = Uint8Array.from([
  0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36,
]);

function aesExpandKey(key: Uint8Array): Uint8Array {
  if (key.length !== 16) throw new Error("AES-128 key must be 16 bytes");
  const schedule = new Uint8Array(176);
  schedule.set(key);
  const temp = new Uint8Array(4);
  for (let word = 4; word < 44; word++) {
    const prev = (word - 1) * 4;
    temp.set(schedule.subarray(prev, prev + 4));
    if (word % 4 === 0) {
      const first = temp[0];
      temp[0] = AES_SBOX[temp[1]] ^ AES_RCON[word / 4];
      temp[1] = AES_SBOX[temp[2]];
      temp[2] = AES_SBOX[temp[3]];
      temp[3] = AES_SBOX[first];
    }
    const dst = word * 4;
    const src = (word - 4) * 4;
    for (let i = 0; i < 4; i++) schedule[dst + i] = schedule[src + i] ^ temp[i];
  }
  return schedule;
}

const xtime = (x: number): number => ((x << 1) ^ ((x >>> 7) & 1 ? 0x1b : 0)) & 0xff;

/**
 * Encrypt a single 16-byte block with AES-128 in ECB mode. The state layout
 * matches the reference generators: byte `row*4 + col` of the flat array.
 */
export function aes128EncryptBlock(key: Uint8Array, block: Uint8Array): Uint8Array {
  if (block.length !== 16) throw new Error("AES block must be 16 bytes");
  const schedule = aesExpandKey(key);
  const state = block.slice();

  const addRoundKey = (round: number) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) state[r * 4 + c] ^= schedule[round * 16 + r * 4 + c];
    }
  };
  const subBytes = () => {
    for (let i = 0; i < 16; i++) state[i] = AES_SBOX[state[i]];
  };
  const shiftRows = () => {
    const s = state.slice();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) state[r * 4 + c] = s[((r + c) % 4) * 4 + c];
    }
  };
  const mixColumns = () => {
    for (let r = 0; r < 4; r++) {
      const base = r * 4;
      const [a0, a1, a2, a3] = [state[base], state[base + 1], state[base + 2], state[base + 3]];
      const all = a0 ^ a1 ^ a2 ^ a3;
      state[base] ^= xtime(a0 ^ a1) ^ all;
      state[base + 1] ^= xtime(a1 ^ a2) ^ all;
      state[base + 2] ^= xtime(a2 ^ a3) ^ all;
      state[base + 3] ^= xtime(a3 ^ a0) ^ all;
    }
  };

  addRoundKey(0);
  for (let round = 1; round < 10; round++) {
    subBytes();
    shiftRows();
    mixColumns();
    addRoundKey(round);
  }
  subBytes();
  shiftRows();
  addRoundKey(10);
  return state;
}
