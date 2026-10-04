const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

export const utf8Encode = (text: string) => utf8Encoder.encode(text);

export function utf8Decode(bytes: Uint8Array) {
  try {
    return utf8Decoder.decode(bytes);
  } catch {
    throw new Error("The decoded bytes aren't valid UTF-8 text.");
  }
}

export function bytesToBase64(bytes: Uint8Array, urlSafe = false) {
  let binary = "";
  // Chunk to stay under the argument limit of String.fromCharCode.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const base64 = btoa(binary);
  return urlSafe ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64;
}

/** Accepts standard or URL-safe Base64, with or without padding and whitespace. */
export function base64ToBytes(input: string) {
  let normalized = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (normalized.length % 4 === 1 || /[^A-Za-z0-9+/=]/.test(normalized)) {
    throw new Error("This isn't valid Base64.");
  }
  normalized = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  try {
    return Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0));
  } catch {
    throw new Error("This isn't valid Base64.");
  }
}

export const encodeBase64 = (text: string, urlSafe = false) =>
  bytesToBase64(utf8Encode(text), urlSafe);

export const decodeBase64 = (input: string) => utf8Decode(base64ToBytes(input));

export const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
