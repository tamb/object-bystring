export default function byStringOriginal(
  obj: any,
  key: string,
  value?: any
): any {
  const keys = key.split(/\.|\[(\d+)\]/).filter(Boolean);
  let currentObj = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const currentKey = keys[i];
    // If the current key is a number, treat it as an array index
    if (/^\d+$/.test(keys[i + 1])) {
      if (!Array.isArray(currentObj[currentKey])) {
        currentObj[currentKey] = [];
      }
    } else {
      if (!currentObj[currentKey]) {
        // Check if the next key is a number, to decide whether to create an array or an object
        const nextKeyIsArray = /^\d+$/.test(keys[i + 1]);
        currentObj[currentKey] = nextKeyIsArray ? [] : {};
      }
    }
    currentObj = currentObj[currentKey];
  }

  if (value !== undefined) {
    currentObj[keys[keys.length - 1]] = value;
  } else {
    let result = obj;
    for (const currentKey of keys) {
      if (!result || typeof result !== "object") {
        return undefined;
      }
      result = result[currentKey];
    }
    return result;
  }
}
