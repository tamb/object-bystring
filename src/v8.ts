function byStringV8(obj: any, key: string, value?: any): any {
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

  let current = obj;
  let start = 0;
  const isSet = value !== undefined;

  for (let i = 0; i <= len; i++) {
    const char = i < len ? key[i] : null;
    const isEnd = i === len;

    if (char === "." || char === "[" || isEnd) {
      if (char !== "[" || start < i) {
        const prop = key.slice(start, isEnd ? len : i);

        if (char === "[") {
          if (isSet) {
            if (current[prop] == null) {
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
          if (isSet) {
            current[prop] = value;
            return value;
          }
          return typeof current === "object" && current != null
            ? current[prop]
            : undefined;
        } else {
          if (isSet) {
            if (current[prop] == null) {
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

      if (char === "[") {
        i++;
        start = i;

        while (i < len && key[i] !== "]") i++;

        if (i >= len) {
          const malformed = key.slice(start - 1);
          if (isSet) {
            current[malformed] = value;
            return value;
          }
          return undefined;
        }

        const indexStr = key.slice(start, i);
        const index = parseInt(indexStr, 10);

        if (isNaN(index) || indexStr !== index.toString()) {
          const propName = `[${indexStr}]`;
          if (isSet) {
            current[propName] = value;
            return value;
          }
          return current && typeof current === "object"
            ? current[propName]
            : undefined;
        }

        i++;

        if (i >= len) {
          if (isSet) {
            if (!Array.isArray(current)) current = [];
            if (current.length <= index) current.length = index + 1;
            current[index] = value;
            return value;
          }
          return Array.isArray(current) ? current[index] : undefined;
        }

        if (isSet) {
          if (!Array.isArray(current)) current = [];
          if (current.length <= index) current.length = index + 1;
          if (current[index] == null) {
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

        if (i < len && key[i] === ".") i++;
        start = i;
        continue;
      }

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

export { byStringV8 };
