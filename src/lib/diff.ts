// Myers' O(ND) diff over arrays of strings (lines or words).

export type DiffOp = { type: "equal" | "delete" | "insert"; count: number };

const MAX_EDITS = 10000;

export function diff(a: string[], b: string[]): DiffOp[] {
  // Common prefix and suffix don't need the full algorithm.
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++;
  }
  const middle = myers(a.slice(prefix, a.length - suffix), b.slice(prefix, b.length - suffix));
  return merge([
    { type: "equal", count: prefix },
    ...middle,
    { type: "equal", count: suffix },
  ]);
}

function myers(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return [{ type: "delete", count: n }, { type: "insert", count: m }];

  const max = Math.min(n + m, MAX_EDITS);
  const offset = max + 1;
  const v = new Int32Array(2 * max + 3);
  // trace[d][k + d] = furthest x on diagonal k after d edits.
  const trace: Int32Array[] = [];

  for (let d = 0; d <= max; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
          ? v[offset + k + 1]
          : v[offset + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) {
        trace.push(v.slice(offset - d, offset + d + 1));
        return backtrack(trace, n, m);
      }
    }
    trace.push(v.slice(offset - d, offset + d + 1));
  }
  // Too different to diff cheaply: treat as a full replacement.
  return [{ type: "delete", count: n }, { type: "insert", count: m }];
}

function backtrack(trace: Int32Array[], n: number, m: number): DiffOp[] {
  const ops: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d > 0; d--) {
    const previous = trace[d - 1];
    const at = (k: number) => previous[k + d - 1];
    const k = x - y;
    const prevK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
    const prevX = at(prevK);
    const inserted = prevK === k + 1; // moved down (insert) rather than right (delete)
    // Walking backwards: the equal run after the edit, then the edit itself.
    const equal = inserted ? x - prevX : x - prevX - 1;
    if (equal > 0) ops.push({ type: "equal", count: equal });
    ops.push({ type: inserted ? "insert" : "delete", count: 1 });
    x = prevX;
    y = prevX - prevK;
  }
  if (x > 0) ops.push({ type: "equal", count: x });
  return ops.reverse();
}

function merge(ops: DiffOp[]): DiffOp[] {
  const out: DiffOp[] = [];
  for (const op of ops) {
    if (op.count === 0) continue;
    const last = out[out.length - 1];
    if (last && last.type === op.type) last.count += op.count;
    else out.push({ ...op });
  }
  return out;
}
