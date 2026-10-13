const DOT = 46;
const ZERO = 48;
const OPEN_BRACKET = 91;
const CLOSE_BRACKET = 93;
const MAX_ARRAY_INDEX = 4_294_967_294;

function byString(obj: any, key: string, value?: any): any {
  const len = key.length;

  if (len === 0) {
    if (value !== undefined) {
      obj[""] = value;
      return value;
    }
    return obj;
  }

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
    return obj[""];
  }

  let current = obj;
  let start = 0;
  const isSet = value !== undefined;

  // Character codes avoid creating one-character strings in the hot loop.
  for (let i = 0; i < len; i++) {
    const charCode = key.charCodeAt(i);
    if (charCode !== DOT && charCode !== OPEN_BRACKET) continue;

    if (charCode === DOT) {
      const prop = key.slice(start, i);

      if (isSet) {
        if (current[prop] == null) {
          current[prop] = key.charCodeAt(i + 1) === OPEN_BRACKET ? [] : {};
        }
        current = current[prop];
      } else {
        if (typeof current !== "object" || current == null) return undefined;
        current = current[prop];
        if (current == null) return undefined;
      }

      i++;
      start = i;
      if (i >= len) return current;
      continue;
    }

    if (start < i) {
      const prop = key.slice(start, i);
      if (isSet) {
        if (current[prop] == null) current[prop] = [];
        current = current[prop];
      } else {
        if (typeof current !== "object" || current == null) return undefined;
        current = current[prop];
        if (current == null) return undefined;
      }
    }

    i++;
    start = i;
    while (i < len && key.charCodeAt(i) !== CLOSE_BRACKET) i++;

    if (i >= len) {
      if (isSet) {
        current[key.slice(start - 1)] = value;
        return value;
      }
      return undefined;
    }

    // Parse common indices without allocating a substring.
    let index = 0;
    let isCanonicalIndex =
      start < i &&
      i - start <= 10 &&
      (key.charCodeAt(start) !== ZERO || start + 1 === i);

    for (let j = start; isCanonicalIndex && j < i; j++) {
      const digit = key.charCodeAt(j) - ZERO;
      if (digit < 0 || digit > 9) {
        isCanonicalIndex = false;
      } else {
        index = index * 10 + digit;
      }
    }

    if (!isCanonicalIndex) {
      const indexStr = key.slice(start, i);
      index = parseInt(indexStr, 10);
      isCanonicalIndex = !isNaN(index) && indexStr === index.toString();

      if (!isCanonicalIndex) {
        const propName = `[${indexStr}]`;
        if (isSet) {
          current[propName] = value;
          return value;
        }
        return current && typeof current === "object"
          ? current[propName]
          : undefined;
      }
    }

    i++;

    if (i >= len) {
      if (isSet) {
        if (!Array.isArray(current)) current = [];
        // Native assignment grows valid sparse arrays. Preserve the old
        // RangeError behavior for numeric keys above JavaScript's index limit.
        if (index > MAX_ARRAY_INDEX && current.length <= index) {
          current.length = index + 1;
        }
        current[index] = value;
        return value;
      }
      return Array.isArray(current) ? current[index] : undefined;
    }

    if (isSet) {
      if (!Array.isArray(current)) current = [];
      if (index > MAX_ARRAY_INDEX && current.length <= index) {
        current.length = index + 1;
      }
      if (current[index] == null) {
        const nextIsArray =
          key.charCodeAt(i) === OPEN_BRACKET ||
          (key.charCodeAt(i) === DOT && key.charCodeAt(i + 1) === OPEN_BRACKET);
        current[index] = nextIsArray ? [] : {};
      }
      current = current[index];
    } else {
      if (!Array.isArray(current)) return undefined;
      current = current[index];
      if (current == null) return undefined;
    }

    if (key.charCodeAt(i) === DOT) i++;
    start = i;
  }

  if (start >= len) return current;

  const prop = key.slice(start);
  if (isSet) {
    current[prop] = value;
    return value;
  }
  return typeof current === "object" && current != null
    ? current[prop]
    : undefined;
}

export { byString };
