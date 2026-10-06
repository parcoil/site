/**
 * Phoenix-style "generic" BIOS passwords (also used by HP/Compaq and several
 * Fujitsu-Siemens models). The firmware stores only a 5-digit hash of the
 * password, computed with a buggy CRC-16 whose image space is tiny, so a short
 * randomised search reliably finds *a* password that hashes to the challenge.
 * Any such password unlocks the machine. Algorithm documented by Dogbert.
 */

/* eslint-disable no-bitwise */
import { defineGenerator, stripSeparators, type BiosGenerator } from "../generator";
import { CHAR_TO_SCAN_CODE, scanCodesToText, textToScanCodes } from "../scancodes";

const DIGITS = "123456789".split("");
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

interface PhoenixParams {
  id: string;
  label: string;
  description: string;
  vendor?: string;
  salt?: number;
  shift?: number;
  dictionary?: string[];
  minLen?: number;
  maxLen?: number;
}

/**
 * The quartered CRC-16 the firmware actually uses (polynomial 0x2001 instead of
 * 0xA001), which is why both high bits of the result are always zero.
 */
function badCrc16(scanCodes: readonly number[], salt: number): number {
  let hash = salt;
  for (const code of scanCodes) {
    hash ^= code;
    for (let i = 0; i < 8; i++) hash = hash & 1 ? (hash >> 1) ^ 0x2001 : hash >> 1;
  }
  return hash;
}

export interface PhoenixVariant {
  generator: BiosGenerator;
  /** Hash a candidate password the same way the firmware would. */
  calculateHash(password: string): number;
}

function makePhoenix(params: PhoenixParams): PhoenixVariant {
  const salt = params.salt ?? 0;
  const shift = params.shift ?? 0;
  const dictionary = params.dictionary ?? LETTERS;
  const minLen = params.minLen ?? 3;
  const maxLen = params.maxLen ?? 7;

  const search = (target: number): string[] => {
    const required = target + shift;
    if (required > 0x3fff) return [];

    const buffer = new Array<number>(maxLen).fill(0);
    for (let attempt = 0; attempt < 7_000_000; attempt++) {
      // Fill the buffer with a pseudo-random candidate from the dictionary.
      let rnd = Math.random() * dictionary.length;
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = CHAR_TO_SCAN_CODE[dictionary[Math.floor(rnd % dictionary.length)]];
        rnd *= buffer.length;
      }
      // Accept the shortest prefix (>= minLen) that hashes to the challenge.
      let hash = salt;
      for (let i = 0; i < buffer.length; i++) {
        hash ^= buffer[i];
        for (let j = 0; j < 8; j++) hash = hash & 1 ? (hash >> 1) ^ 0x2001 : hash >> 1;
        if (i + 1 >= minLen && hash === required) {
          return [scanCodesToText(buffer.slice(0, i + 1))];
        }
      }
    }
    return [];
  };

  const generator = defineGenerator({
    id: params.id,
    vendor: params.vendor ?? "Phoenix",
    label: params.label,
    description: params.description,
    examples: ["12345"],
    normalize: stripSeparators,
    matches: (code) => /^\d{5}$/.test(code),
    generate: (code) => search(parseInt(code, 10)),
  });

  const calculateHash = (password: string): number =>
    badCrc16(textToScanCodes(password), salt) - shift;

  return { generator, calculateHash };
}

export const phoenixVariants: PhoenixVariant[] = [
  makePhoenix({ id: "phoenix-generic", label: "Phoenix (generic)", description: "Generic Phoenix 5-digit challenge." }),
  makePhoenix({
    id: "phoenix-hp-compaq",
    vendor: "HP / Compaq",
    label: "HP / Compaq (Phoenix)",
    description: "HP/Compaq Phoenix 5-digit challenge.",
    salt: 17232,
  }),
  makePhoenix({
    id: "phoenix-fsi",
    vendor: "Fujitsu-Siemens",
    label: "Fujitsu-Siemens (Phoenix)",
    description: "Fujitsu-Siemens Phoenix 5-digit challenge.",
    salt: 65,
    dictionary: DIGITS,
  }),
  ...(["L", "P", "S", "X"] as const).map((model) =>
    makePhoenix({
      id: `phoenix-fsi-${model.toLowerCase()}`,
      vendor: "Fujitsu-Siemens",
      label: `Fujitsu-Siemens model ${model} (Phoenix)`,
      description: `Fujitsu-Siemens model ${model} Phoenix 5-digit challenge.`,
      shift: 1,
      salt: model.charCodeAt(0),
      dictionary: DIGITS,
    }),
  ),
];

export const phoenixGenerators: BiosGenerator[] = phoenixVariants.map((v) => v.generator);
