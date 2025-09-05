// ULTRA-OPTIMIZED: Complete inline, zero-allocation approach
function byString(obj: any, key: string, value?: any): any {
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
