/**
 * IBM PC "set 1" keyboard scan codes.
 *
 * Several BIOS password schemes store or emit the password as the raw scan
 * codes the keyboard controller produced, rather than as ASCII. Recovering a
 * typeable password therefore means mapping those scan codes back to the
 * characters printed on a US keyboard. This is a hardware fact, not a secret.
 */

/** scan code -> character on a US layout (unshifted). */
export const SCAN_CODE_TO_CHAR: Readonly<Record<number, string>> = {
  2: "1", 3: "2", 4: "3", 5: "4", 6: "5", 7: "6", 8: "7", 9: "8",
  10: "9", 11: "0", 16: "q", 17: "w", 18: "e", 19: "r", 20: "t", 21: "y",
  22: "u", 23: "i", 24: "o", 25: "p", 30: "a", 31: "s", 32: "d", 33: "f",
  34: "g", 35: "h", 36: "j", 37: "k", 38: "l", 44: "z", 45: "x", 46: "c",
  47: "v", 48: "b", 49: "n", 50: "m",
};

/** character -> scan code (inverse of {@link SCAN_CODE_TO_CHAR}). */
export const CHAR_TO_SCAN_CODE: Readonly<Record<string, number>> = Object.freeze(
  Object.entries(SCAN_CODE_TO_CHAR).reduce<Record<string, number>>((acc, [code, char]) => {
    acc[char] = Number(code);
    return acc;
  }, {}),
);

/**
 * Decode a run of scan codes to text. A zero byte terminates the password; an
 * unmapped non-zero byte means the buffer is not a valid scan-code password, so
 * the whole thing is rejected by returning an empty string.
 */
export function scanCodesToText(codes: readonly number[]): string {
  let text = "";
  for (const code of codes) {
    if (code === 0) return text;
    const char = SCAN_CODE_TO_CHAR[code];
    if (char === undefined) return "";
    text += char;
  }
  return text;
}

/** Encode text back to scan codes. Throws on any character with no scan code. */
export function textToScanCodes(text: string): number[] {
  return [...text].map((char) => {
    const code = CHAR_TO_SCAN_CODE[char];
    if (code === undefined) throw new Error(`No scan code for character ${JSON.stringify(char)}`);
    return code;
  });
}
