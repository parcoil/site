// Cryptographically secure randomness from the Web Crypto API.

const UINT32_RANGE = 2 ** 32;

/** Uniform float in [0, 1) with 53 bits of randomness. */
export function randomFloat() {
  const [hi, lo] = crypto.getRandomValues(new Uint32Array(2));
  return (hi * 2 ** 21 + (lo >>> 11)) / 2 ** 53;
}

/** Uniform integer in [0, max). Rejection sampling avoids modulo bias. */
export function randomInt(max: number) {
  if (max <= 0) return 0;
  if (max > UINT32_RANGE) return Math.floor(randomFloat() * max);
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    value = crypto.getRandomValues(buffer)[0];
  } while (value >= limit);
  return value % max;
}

/** Uniform integer in [min, max], inclusive. */
export const randomBetween = (min: number, max: number) => min + randomInt(max - min + 1);

export const randomItem = <T>(items: readonly T[]) => items[randomInt(items.length)];

/** Fisher–Yates shuffle into a new array. Pass `rand` for a repeatable order. */
export function shuffle<T>(items: readonly T[], rand?: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand ? Math.floor(rand() * (i + 1)) : randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Small seeded PRNG for results that must stay stable across re-renders. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}
