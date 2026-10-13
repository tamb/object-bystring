// Repeated paths are compiled once into direct property accessors.
// The first sighting of a key (and every non-simple key) uses the inline walker.

const RING_SIZE = 32;
const CACHE_MAX = 1024;
const MAX_KEY_LENGTH = 2048;
const MAX_SEGMENTS = 48;

const DOT = 46;
const LB = 91; // [
const RB = 93; // ]
const ZERO = 48;
const NINE = 57;

type Compiled = {
  set: (obj: any, value: any) => any;
  get: (obj: any) => any;
};

let cache: Record<string, Compiled | null> = Object.create(null);
let cacheSize = 0;
const ring: Array<string | undefined> = new Array(RING_SIZE);
let ringPos = 0;

function resetCache(): void {
  cache = Object.create(null);
  cacheSize = 0;
}

function remember(key: string, fn: Compiled | null): void {
  if (cacheSize >= CACHE_MAX) resetCache();
  cache[key] = fn;
  cacheSize++;
}

function byString(obj: any, key: string, value?: any): any {
  if (typeof key !== "string") return byStringSlow(obj, key, value);

  const hit = cache[key];
  if (hit !== undefined) {
    if (hit === null) return byStringSlow(obj, key, value);
    return value !== undefined ? hit.set(obj, value) : hit.get(obj);
  }

  for (let i = 0; i < RING_SIZE; i++) {
    if (ring[i] === key) {
      const fn = compile(key);
      remember(key, fn);
      if (fn === null) return byStringSlow(obj, key, value);
      return value !== undefined ? fn.set(obj, value) : fn.get(obj);
    }
  }

  ring[ringPos] = key;
  ringPos++;
  if (ringPos === RING_SIZE) ringPos = 0;
  return byStringSlow(obj, key, value);
}

function compile(key: string): Compiled | null {
  if (key.length > MAX_KEY_LENGTH) return null;
  const segs = parseSimple(key);
  if (segs === null || segs.length === 0 || segs.length > MAX_SEGMENTS)
    return null;

  let setBody = '"use strict";let c=o;';
  let getBody = '"use strict";let c=o;';

  for (let s = 0; s < segs.length; s++) {
    const seg = segs[s];
    const last = s === segs.length - 1;

    if (typeof seg === "string") {
      const ref = "[" + JSON.stringify(seg) + "]";
      if (last) {
        setBody += "c" + ref + "=v;return v;";
        getBody += 'return c!=null&&typeof c==="object"?c' + ref + ":void 0;";
      } else {
        const init = typeof segs[s + 1] === "number" ? "[]" : "{}";
        setBody +=
          "if(c" + ref + "==null)c" + ref + "=" + init + ";c=c" + ref + ";";
        getBody +=
          'if(c==null||typeof c!=="object")return;c=c' +
          ref +
          ";if(c==null)return;";
      }
    } else {
      if (!Number.isSafeInteger(seg) || seg < 0) return null;
      if (last) {
        setBody +=
          "if(!Array.isArray(c))c=[];if(c.length<=" +
          seg +
          ")c.length=" +
          (seg + 1) +
          ";c[" +
          seg +
          "]=v;return v;";
        getBody += "return Array.isArray(c)?c[" + seg + "]:void 0;";
      } else {
        const init = typeof segs[s + 1] === "number" ? "[]" : "{}";
        setBody +=
          "if(!Array.isArray(c))c=[];if(c.length<=" +
          seg +
          ")c.length=" +
          (seg + 1) +
          ";if(c[" +
          seg +
          "]==null)c[" +
          seg +
          "]=" +
          init +
          ";c=c[" +
          seg +
          "];";
        getBody +=
          "if(!Array.isArray(c))return;c=c[" + seg + "];if(c==null)return;";
      }
    }
  }

  try {
    const set = new Function("o", "v", setBody) as Compiled["set"];
    const get = new Function("o", getBody) as Compiled["get"];
    return { set, get };
  } catch {
    return null;
  }
}

// Simple paths are non-empty property names separated by dots, with at most
// one canonical array index after a property (not another bracket, leading
// zeros, or a trailing dot). Anything else stays on the slow walker.
function parseSimple(key: string): Array<string | number> | null {
  const len = key.length;
  if (len === 0 || key.charCodeAt(0) === DOT) return null;

  const segs: Array<string | number> = [];
  let i = 0;

  while (i < len) {
    const c0 = key.charCodeAt(i);
    if (c0 === DOT || c0 === LB) return null;

    const start = i;
    i++;
    while (i < len) {
      const c = key.charCodeAt(i);
      if (c === DOT || c === LB) break;
      i++;
    }
    segs.push(key.slice(start, i));

    if (i >= len) return segs;

    if (key.charCodeAt(i) === DOT) {
      i++;
      if (i >= len || key.charCodeAt(i) === DOT) return null;
      continue;
    }

    i++; // skip [
    const parsed = parseIndex(key, i, len);
    if (parsed === null) return null;
    segs.push(parsed.index);
    i = parsed.next;
    if (i >= len) return segs;
    if (key.charCodeAt(i) !== DOT) return null;
    i++;
    if (i >= len) return null;
  }

  return null;
}

function parseIndex(
  key: string,
  i: number,
  len: number
): { index: number; next: number } | null {
  let c = key.charCodeAt(i);
  if (c < ZERO || c > NINE) return null;

  if (c === ZERO) {
    if (key.charCodeAt(i + 1) !== RB) return null;
    return { index: 0, next: i + 2 };
  }

  let index = 0;
  let digits = 0;
  while (c >= ZERO && c <= NINE) {
    index = index * 10 + (c - ZERO);
    digits++;
    i++;
    if (i >= len || digits > 15) return null;
    c = key.charCodeAt(i);
  }
  if (c !== RB || !Number.isSafeInteger(index)) return null;
  return { index, next: i + 1 };
}

function byStringSlow(obj: any, key: string, value?: any): any {
  const len = key.length;

  // Handle empty key or dots-only key
  if (len === 0) {
    if (value !== undefined) {
      obj[""] = value;
      return value;
    }
    return obj;
  }

  // Check if key contains only dots - treat as empty key
  let hasNonDot = false;
  for (let j = 0; j < len; j++) {
    if (key[j] !== ".") {
      hasNonDot = true;
      break;
    }
  }
  if (!hasNonDot) {
    if (value !== undefined) {
      obj[""] = value;
      return value;
    }
    return obj[""];
  }

  // Single-pass parsing with inline execution
  let current = obj;
  let start = 0;
  const isSet = value !== undefined;

  for (let i = 0; i <= len; i++) {
    const char = i < len ? key[i] : null;
    const isEnd = i === len;

    if (char === "." || char === "[" || isEnd) {
      // Extract property name
      if (char !== "[" || start < i) {
        const prop = key.slice(start, isEnd ? len : i);

        if (char === "[") {
          // Property followed by array access
          if (isSet) {
            if (current[prop] == null) {
              // This property will have array access, so create an array
              current[prop] = [];
            }
            current = current[prop];
          } else {
            if (typeof current !== "object" || current == null)
              return undefined;
            current = current[prop];
            if (current == null) return undefined;
          }
        } else if (isEnd) {
          // Final property
          if (isSet) {
            current[prop] = value;
            return value;
          }
          return typeof current === "object" && current != null
            ? current[prop]
            : undefined;
        } else {
          // Property with more to come
          if (isSet) {
            if (current[prop] == null) {
              // Peek ahead
              const nextChar = i + 1 < len ? key[i + 1] : "";
              current[prop] = nextChar === "[" ? [] : {};
            }
            current = current[prop];
          } else {
            if (typeof current !== "object" || current == null)
              return undefined;
            current = current[prop];
            if (current == null) return undefined;
          }
        }
      }

      // Handle array access
      if (char === "[") {
        i++; // Skip [
        start = i;

        // Find closing bracket
        while (i < len && key[i] !== "]") i++;

        if (i >= len) {
          // Malformed - treat remaining as property
          const malformed = key.slice(start - 1);
          if (isSet) {
            current[malformed] = value;
            return value;
          }
          return undefined;
        }

        // Parse index
        const indexStr = key.slice(start, i);
        const index = parseInt(indexStr, 10);

        if (isNaN(index) || indexStr !== index.toString()) {
          // Non-numeric - treat as property
          const propName = `[${indexStr}]`;
          if (isSet) {
            current[propName] = value;
            return value;
          }
          return current && typeof current === "object"
            ? current[propName]
            : undefined;
        }

        i++; // Skip ]

        // Check if final
        if (i >= len) {
          if (isSet) {
            if (!Array.isArray(current)) current = [];
            if (current.length <= index) current.length = index + 1;
            current[index] = value;
            return value;
          }
          return Array.isArray(current) ? current[index] : undefined;
        }

        // More segments
        if (isSet) {
          if (!Array.isArray(current)) current = [];
          if (current.length <= index) current.length = index + 1;
          if (current[index] == null) {
            // Look ahead to see what's next
            let nextIsArray = false;
            if (i < len && key[i] === ".") {
              nextIsArray = i + 1 < len && key[i + 1] === "[";
            } else {
              nextIsArray = i < len && key[i] === "[";
            }
            current[index] = nextIsArray ? [] : {};
          }
          current = current[index];
        } else {
          if (!Array.isArray(current)) return undefined;
          current = current[index];
          if (current == null) return undefined;
        }

        // Skip . if present
        if (i < len && key[i] === ".") i++;
        start = i;
        continue;
      }

      // Update start position
      if (char === ".") {
        i++;
        start = i;
      } else if (!isEnd) {
        start = i;
      }
    }
  }

  return current;
}

export { byString };
