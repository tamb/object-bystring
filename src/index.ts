// Single-pass charCode scanner with separate get/set paths. Behaviour, including
// the order of every property read and write, matches v8.0.0 exactly.

const DOT = 46; // .
const OPEN = 91; // [
const CLOSE = 93; // ]
const MINUS = 45; // -
const ZERO = 48; // 0
const NINE = 57; // 9

// Parses key[from, to) as an array index. Returns NaN unless the text is the
// canonical form of an integer, i.e. `s === String(parseInt(s, 10))`.
function parseIndex(key: string, from: number, to: number): number {
  let k = from;
  let negative = false;
  if (k < to && key.charCodeAt(k) === MINUS) {
    negative = true;
    k++;
  }
  const digits = to - k;
  if (digits === 0) return NaN;
  // Beyond 15 digits a decimal string may not round-trip through a double.
  if (digits > 15) {
    const text = key.slice(from, to);
    const parsed = parseInt(text, 10);
    return text === parsed.toString() ? parsed : NaN;
  }
  let c = key.charCodeAt(k);
  if (c === ZERO) return digits === 1 && !negative ? 0 : NaN;
  if (c < ZERO || c > NINE) return NaN;
  let n = c - ZERO;
  for (k++; k < to; k++) {
    c = key.charCodeAt(k);
    if (c < ZERO || c > NINE) return NaN;
    n = n * 10 + (c - ZERO);
  }
  return negative ? -n : n;
}

// The character immediately after a "." or "]" is always part of the next
// property name, never a delimiter, so scanning resumes one position later.
function setPath(obj: any, key: string, len: number, value: any): any {
  let current = obj;
  let start = 0;
  let i = 0;
  for (;;) {
    let c = 0;
    while (i < len) {
      c = key.charCodeAt(i);
      if (c === DOT || c === OPEN) break;
      i++;
    }

    if (i === len) {
      current[key.slice(start, len)] = value;
      return value;
    }

    if (c === DOT) {
      const prop = key.slice(start, i);
      if (current[prop] == null) {
        current[prop] = i + 1 < len && key.charCodeAt(i + 1) === OPEN ? [] : {};
      }
      current = current[prop];
      start = i + 1;
      i += 2;
      if (i > len) return current;
      continue;
    }

    if (start < i) {
      const prop = key.slice(start, i);
      if (current[prop] == null) current[prop] = [];
      current = current[prop];
    }

    let close = i + 1;
    while (close < len && key.charCodeAt(close) !== CLOSE) close++;
    if (close === len) {
      current[key.slice(i)] = value;
      return value;
    }

    const index = parseIndex(key, i + 1, close);
    if (index !== index) {
      current[key.slice(i, close + 1)] = value;
      return value;
    }

    i = close + 1;
    if (!Array.isArray(current)) current = [];
    if (current.length <= index) current.length = index + 1;
    if (i >= len) {
      current[index] = value;
      return value;
    }

    c = key.charCodeAt(i);
    if (current[index] == null) {
      const nextIsArray =
        c === DOT ? i + 1 < len && key.charCodeAt(i + 1) === OPEN : c === OPEN;
      current[index] = nextIsArray ? [] : {};
    }
    current = current[index];
    if (c === DOT) i++;
    start = i;
    i++;
    if (i > len) return current;
  }
}

function getPath(obj: any, key: string, len: number): any {
  let current = obj;
  let start = 0;
  let i = 0;
  for (;;) {
    let c = 0;
    while (i < len) {
      c = key.charCodeAt(i);
      if (c === DOT || c === OPEN) break;
      i++;
    }

    if (i === len) {
      return typeof current === "object" && current != null
        ? current[key.slice(start, len)]
        : undefined;
    }

    if (c === DOT) {
      if (typeof current !== "object" || current == null) return undefined;
      current = current[key.slice(start, i)];
      if (current == null) return undefined;
      start = i + 1;
      i += 2;
      if (i > len) return current;
      continue;
    }

    if (start < i) {
      if (typeof current !== "object" || current == null) return undefined;
      current = current[key.slice(start, i)];
      if (current == null) return undefined;
    }

    let close = i + 1;
    while (close < len && key.charCodeAt(close) !== CLOSE) close++;
    if (close === len) return undefined;

    const index = parseIndex(key, i + 1, close);
    if (index !== index) {
      return current && typeof current === "object"
        ? current[key.slice(i, close + 1)]
        : undefined;
    }

    i = close + 1;
    if (!Array.isArray(current)) return undefined;
    if (i >= len) return current[index];
    current = current[index];
    if (current == null) return undefined;
    if (key.charCodeAt(i) === DOT) i++;
    start = i;
    i++;
    if (i > len) return current;
  }
}

function byString(obj: any, key: string, value?: any): any {
  const len = key.length;

  // Empty and dots-only keys address the "" property.
  let hasNonDot = false;
  for (let j = 0; j < len; j++) {
    if (key.charCodeAt(j) !== DOT) {
      hasNonDot = true;
      break;
    }
  }
  if (!hasNonDot) {
    if (value !== undefined) {
      obj[""] = value;
      return value;
    }
    return len === 0 ? obj : obj[""];
  }

  return value !== undefined
    ? setPath(obj, key, len, value)
    : getPath(obj, key, len);
}

export { byString };
