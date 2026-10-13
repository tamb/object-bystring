interface Accessor {
  get(obj: any): any;
  set(obj: any, value: any): any;
}

interface PathToken {
  isProp: boolean;
  key: string | number;
  nextIsArray: boolean;
  isLast: boolean;
  isUnclosed: boolean;
}

const pathCache = new Map<string, Accessor>();
const MAX_CACHE_SIZE = 10000;

function parseKeyToAccessor(key: string, len: number): Accessor {
  if (pathCache.size >= MAX_CACHE_SIZE) {
    pathCache.clear();
  }

  const tokens: PathToken[] = [];
  let start = 0;

  for (let i = 0; i <= len; i++) {
    const isEnd = i === len;
    const code = isEnd ? 0 : key.charCodeAt(i);

    if (code === 46 || code === 91 || isEnd) {
      if (code !== 91 || start < i) {
        tokens.push({
          isProp: true,
          key: key.slice(start, i),
          nextIsArray: code === 91,
          isLast: isEnd,
          isUnclosed: false,
        });
      }

      if (code === 91) {
        i++;
        start = i;
        let index = 0;
        let isNum = false;

        while (i < len) {
          const c = key.charCodeAt(i);
          if (c === 93) break;
          if (c >= 48 && c <= 57) {
            index = index * 10 + (c - 48);
            isNum = true;
          } else {
            isNum = false;
          }
          i++;
        }

        if (i >= len) {
          tokens.push({
            isProp: true,
            key: key.slice(start - 1),
            nextIsArray: false,
            isLast: true,
            isUnclosed: true,
          });
          break;
        }

        if (!isNum || (i - start > 1 && key.charCodeAt(start) === 48)) {
          tokens.push({
            isProp: true,
            key: `[${key.slice(start, i)}]`,
            nextIsArray: false,
            isLast: true,
            isUnclosed: false,
          });
          break;
        }

        i++;
        const isLast = i >= len;
        let nextIsArray = false;
        if (!isLast) {
          if (key.charCodeAt(i) === 46) {
            nextIsArray = i + 1 < len && key.charCodeAt(i + 1) === 91;
          } else {
            nextIsArray = key.charCodeAt(i) === 91;
          }
        }

        tokens.push({
          isProp: false,
          key: index,
          nextIsArray,
          isLast,
          isUnclosed: false,
        });

        if (i < len && key.charCodeAt(i) === 46) {
          i++;
        }
        start = i;
        continue;
      }

      if (code === 46) {
        const nextIsArray = i + 1 < len && key.charCodeAt(i + 1) === 91;
        if (tokens.length > 0) {
          tokens[tokens.length - 1].nextIsArray = nextIsArray;
        }
        i++;
        start = i;
      }
    }
  }

  const numTokens = tokens.length;
  let getFn: (obj: any) => any;
  let setFn: (obj: any, val: any) => any;

  if (numTokens === 0) {
    getFn = (obj: any) => obj;
    setFn = (obj: any, val: any) => {
      obj[""] = val;
      return val;
    };
  } else if (numTokens === 1) {
    const tok = tokens[0];
    const k = tok.key;
    const u = tok.isUnclosed;
    if (tok.isProp) {
      getFn = (obj: any) =>
        !u && typeof obj === "object" && obj != null ? obj[k] : undefined;
      setFn = (obj: any, val: any) => {
        obj[k] = val;
        return val;
      };
    } else {
      const idx = k as number;
      getFn = (obj: any) => (!u && Array.isArray(obj) ? obj[idx] : undefined);
      setFn = (obj: any, val: any) => {
        if (!Array.isArray(obj)) obj = [];
        if (obj.length <= idx) obj.length = idx + 1;
        obj[idx] = val;
        return val;
      };
    }
  } else if (numTokens === 2) {
    const t0 = tokens[0],
      t1 = tokens[1];
    const k0 = t0.key,
      k1 = t1.key;
    const p0 = t0.isProp,
      p1 = t1.isProp;
    const n0 = t0.nextIsArray;
    const u1 = t1.isUnclosed;

    getFn = (obj: any) => {
      if (u1) return undefined;
      let cur: any = obj;
      if (p0) {
        if (typeof cur !== "object" || cur == null) return undefined;
        cur = cur[k0];
      } else {
        if (!Array.isArray(cur)) return undefined;
        cur = cur[k0 as number];
      }
      if (cur == null) return undefined;
      return p1
        ? typeof cur === "object"
          ? cur[k1]
          : undefined
        : Array.isArray(cur)
        ? cur[k1 as number]
        : undefined;
    };

    setFn = (obj: any, val: any) => {
      let cur: any = obj;
      if (p0) {
        if (cur[k0] == null) cur[k0] = n0 ? [] : {};
        cur = cur[k0];
      } else {
        if (!Array.isArray(cur)) cur = [];
        const idx0 = k0 as number;
        if (cur.length <= idx0) cur.length = idx0 + 1;
        if (cur[idx0] == null) cur[idx0] = n0 ? [] : {};
        cur = cur[idx0];
      }
      if (!p1) {
        if (!Array.isArray(cur)) cur = [];
        const idx1 = k1 as number;
        if (cur.length <= idx1) cur.length = idx1 + 1;
      }
      cur[k1] = val;
      return val;
    };
  } else if (numTokens === 3) {
    const t0 = tokens[0],
      t1 = tokens[1],
      t2 = tokens[2];
    const k0 = t0.key,
      k1 = t1.key,
      k2 = t2.key;
    const p0 = t0.isProp,
      p1 = t1.isProp,
      p2 = t2.isProp;
    const n0 = t0.nextIsArray,
      n1 = t1.nextIsArray;
    const u2 = t2.isUnclosed;

    getFn = (obj: any) => {
      if (u2) return undefined;
      let cur: any = obj;
      if (p0) {
        if (typeof cur !== "object" || cur == null) return undefined;
        cur = cur[k0];
      } else {
        if (!Array.isArray(cur)) return undefined;
        cur = cur[k0 as number];
      }
      if (cur == null) return undefined;

      if (p1) {
        if (typeof cur !== "object") return undefined;
        cur = cur[k1];
      } else {
        if (!Array.isArray(cur)) return undefined;
        cur = cur[k1 as number];
      }
      if (cur == null) return undefined;

      return p2
        ? typeof cur === "object"
          ? cur[k2]
          : undefined
        : Array.isArray(cur)
        ? cur[k2 as number]
        : undefined;
    };

    setFn = (obj: any, val: any) => {
      let cur: any = obj;
      if (p0) {
        if (cur[k0] == null) cur[k0] = n0 ? [] : {};
        cur = cur[k0];
      } else {
        if (!Array.isArray(cur)) cur = [];
        const idx0 = k0 as number;
        if (cur.length <= idx0) cur.length = idx0 + 1;
        if (cur[idx0] == null) cur[idx0] = n0 ? [] : {};
        cur = cur[idx0];
      }

      if (p1) {
        if (cur[k1] == null) cur[k1] = n1 ? [] : {};
        cur = cur[k1];
      } else {
        if (!Array.isArray(cur)) cur = [];
        const idx1 = k1 as number;
        if (cur.length <= idx1) cur.length = idx1 + 1;
        if (cur[idx1] == null) cur[idx1] = n1 ? [] : {};
        cur = cur[idx1];
      }

      if (!p2) {
        if (!Array.isArray(cur)) cur = [];
        const idx2 = k2 as number;
        if (cur.length <= idx2) cur.length = idx2 + 1;
      }
      cur[k2] = val;
      return val;
    };
  } else if (numTokens === 4) {
    const t0 = tokens[0],
      t1 = tokens[1],
      t2 = tokens[2],
      t3 = tokens[3];
    const k0 = t0.key,
      k1 = t1.key,
      k2 = t2.key,
      k3 = t3.key;
    const p0 = t0.isProp,
      p1 = t1.isProp,
      p2 = t2.isProp,
      p3 = t3.isProp;
    const n0 = t0.nextIsArray,
      n1 = t1.nextIsArray,
      n2 = t2.nextIsArray;
    const u3 = t3.isUnclosed;

    getFn = (obj: any) => {
      if (u3) return undefined;
      let cur: any = obj;
      if (p0) {
        if (typeof cur !== "object" || cur == null) return undefined;
        cur = cur[k0];
      } else {
        if (!Array.isArray(cur)) return undefined;
        cur = cur[k0 as number];
      }
      if (cur == null) return undefined;

      if (p1) {
        if (typeof cur !== "object") return undefined;
        cur = cur[k1];
      } else {
        if (!Array.isArray(cur)) return undefined;
        cur = cur[k1 as number];
      }
      if (cur == null) return undefined;

      if (p2) {
        if (typeof cur !== "object") return undefined;
        cur = cur[k2];
      } else {
        if (!Array.isArray(cur)) return undefined;
        cur = cur[k2 as number];
      }
      if (cur == null) return undefined;

      return p3
        ? typeof cur === "object"
          ? cur[k3]
          : undefined
        : Array.isArray(cur)
        ? cur[k3 as number]
        : undefined;
    };

    setFn = (obj: any, val: any) => {
      let cur: any = obj;
      if (p0) {
        if (cur[k0] == null) cur[k0] = n0 ? [] : {};
        cur = cur[k0];
      } else {
        if (!Array.isArray(cur)) cur = [];
        const idx0 = k0 as number;
        if (cur.length <= idx0) cur.length = idx0 + 1;
        if (cur[idx0] == null) cur[idx0] = n0 ? [] : {};
        cur = cur[idx0];
      }

      if (p1) {
        if (cur[k1] == null) cur[k1] = n1 ? [] : {};
        cur = cur[k1];
      } else {
        if (!Array.isArray(cur)) cur = [];
        const idx1 = k1 as number;
        if (cur.length <= idx1) cur.length = idx1 + 1;
        if (cur[idx1] == null) cur[idx1] = n1 ? [] : {};
        cur = cur[idx1];
      }

      if (p2) {
        if (cur[k2] == null) cur[k2] = n2 ? [] : {};
        cur = cur[k2];
      } else {
        if (!Array.isArray(cur)) cur = [];
        const idx2 = k2 as number;
        if (cur.length <= idx2) cur.length = idx2 + 1;
        if (cur[idx2] == null) cur[idx2] = n2 ? [] : {};
        cur = cur[idx2];
      }

      if (!p3) {
        if (!Array.isArray(cur)) cur = [];
        const idx3 = k3 as number;
        if (cur.length <= idx3) cur.length = idx3 + 1;
      }
      cur[k3] = val;
      return val;
    };
  } else {
    const lastTok = tokens[numTokens - 1];
    const lastKey = lastTok.key;
    const lastIsProp = lastTok.isProp;
    const lastUnclosed = lastTok.isUnclosed;
    const parentTokens = tokens.slice(0, numTokens - 1);
    const parentCount = parentTokens.length;

    getFn = (obj: any) => {
      if (lastUnclosed) return undefined;
      let cur: any = obj;
      for (let i = 0; i < parentCount; i++) {
        const tok = parentTokens[i];
        if (tok.isProp) {
          if (typeof cur !== "object" || cur == null) return undefined;
          cur = cur[tok.key];
        } else {
          if (!Array.isArray(cur)) return undefined;
          cur = cur[tok.key as number];
        }
        if (cur == null) return undefined;
      }
      if (lastIsProp) {
        return typeof cur === "object" && cur != null
          ? cur[lastKey]
          : undefined;
      } else {
        return Array.isArray(cur) ? cur[lastKey as number] : undefined;
      }
    };

    setFn = (obj: any, val: any) => {
      let cur: any = obj;
      for (let i = 0; i < parentCount; i++) {
        const tok = parentTokens[i];
        const k = tok.key;
        if (tok.isProp) {
          if (cur[k] == null) {
            cur[k] = tok.nextIsArray ? [] : {};
          }
          cur = cur[k];
        } else {
          if (!Array.isArray(cur)) cur = [];
          const idx = k as number;
          if (cur.length <= idx) cur.length = idx + 1;
          if (cur[idx] == null) {
            cur[idx] = tok.nextIsArray ? [] : {};
          }
          cur = cur[idx];
        }
      }
      if (!lastIsProp) {
        if (!Array.isArray(cur)) cur = [];
        const lastIdx = lastKey as number;
        if (cur.length <= lastIdx) cur.length = lastIdx + 1;
      }
      cur[lastKey] = val;
      return val;
    };
  }

  const entry: Accessor = { get: getFn, set: setFn };
  pathCache.set(key, entry);
  return entry;
}

function byString(obj: any, key: string, value?: any): any {
  const len = key.length;

  if (len === 0) {
    if (value !== undefined) {
      obj[""] = value;
      return value;
    }
    return obj;
  }

  if (key.charCodeAt(0) === 46) {
    let hasNonDot = false;
    for (let j = 1; j < len; j++) {
      if (key.charCodeAt(j) !== 46) {
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
  }

  const accessor = pathCache.get(key) || parseKeyToAccessor(key, len);
  return value !== undefined ? accessor.set(obj, value) : accessor.get(obj);
}

export { byString };
