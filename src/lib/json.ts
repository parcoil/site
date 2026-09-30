/** JSON.parse with an error message that always includes the line and column. */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const position = /position (\d+)/.exec(message);
    if (position && !/line \d+/.test(message)) {
      const before = text.slice(0, Number(position[1]));
      const line = before.split("\n").length;
      const column = before.length - before.lastIndexOf("\n");
      throw new Error(`${message.replace(/^JSON\.parse: /, "")} (line ${line}, column ${column})`);
    }
    throw new Error(message.replace(/^JSON\.parse: /, ""));
  }
}

export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}
