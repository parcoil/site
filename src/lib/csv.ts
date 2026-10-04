// RFC 4180 CSV parsing and writing.

export function detectDelimiter(text: string) {
  const newline = text.indexOf("\n");
  const firstLine = newline === -1 ? text : text.slice(0, newline);
  const candidates = [",", ";", "\t", "|"];
  return candidates.reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  );
}

export function parseCsv(text: string, delimiter = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"' && field === "") {
      quoted = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (quoted) throw new Error("A quoted field is never closed.");
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

export function stringifyCsv(rows: unknown[][], delimiter = ","): string {
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /["\n\r]|^\s|\s$/.test(text) || text.includes(delimiter)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };
  return rows.map((row) => row.map(escape).join(delimiter)).join("\n");
}

/** Flattens nested objects into dot-separated keys: {a: {b: 1}} → {"a.b": 1}. */
export function flattenObject(value: unknown, prefix = "", out: Record<string, unknown> = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenObject(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out[prefix || "value"] = Array.isArray(value) ? JSON.stringify(value) : value;
  }
  return out;
}

/** Turns CSV cell text into numbers, booleans and null where it clearly is one. */
export function inferType(text: string): unknown {
  if (text === "") return null;
  if (text === "true" || text === "false") return text === "true";
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(text) && Number.isFinite(Number(text))) {
    return Number(text);
  }
  return text;
}
