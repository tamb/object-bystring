export default function byString(obj: any, key: string, value?: any): any {
  // Parse the key into path segments
  const segments = parseKey(key);

  // If setting a value
  if (value !== undefined) {
    return setValue(obj, segments, value);
  }

  // If getting a value
  return getValue(obj, segments);
}

interface PathSegment {
  type: "property" | "array";
  value: string | number;
}

function parseKey(key: string): PathSegment[] {
  const segments: PathSegment[] = [];
  let current = "";
  let i = 0;

  while (i < key.length) {
    const char = key[i];

    if (char === ".") {
      if (current) {
        segments.push({ type: "property", value: current });
        current = "";
      }
    } else if (char === "[") {
      if (current) {
        segments.push({ type: "property", value: current });
        current = "";
      }

      // Parse array index
      i++;
      let indexStr = "";
      while (i < key.length && key[i] !== "]") {
        indexStr += key[i];
        i++;
      }

      if (i < key.length && key[i] === "]") {
        const index = parseInt(indexStr, 10);
        if (!isNaN(index)) {
          segments.push({ type: "array", value: index });
        }
      }
    } else {
      current += char;
    }

    i++;
  }

  if (current) {
    segments.push({ type: "property", value: current });
  }

  return segments;
}

function setValue(obj: any, segments: PathSegment[], value: any): any {
  // Handle empty segments case - set value directly on object
  if (segments.length === 0) {
    // For empty key, we need to set the value on the object itself
    // This is a special case where we're setting a property with empty string key
    Object.assign(obj, { "": value });
    return value;
  }

  let current = obj;

  // Navigate to the parent of the target
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];

    if (segment.type === "property") {
      if (!current[segment.value]) {
        // Determine if next segment is an array to create the right type
        current[segment.value] = nextSegment.type === "array" ? [] : {};
      }
      current = current[segment.value];
    } else {
      // Array segment
      if (!Array.isArray(current)) {
        current = [];
      }
      // Ensure array is large enough
      while (current.length <= segment.value) {
        current.push(undefined);
      }
      // If the current element is undefined, initialize it based on next segment
      if (current[segment.value] === undefined) {
        current[segment.value] = nextSegment.type === "array" ? [] : {};
      }
      current = current[segment.value];
    }
  }

  // Set the final value
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.type === "property") {
    current[lastSegment.value] = value;
  } else {
    if (!Array.isArray(current)) {
      current = [];
    }
    // Ensure array is large enough
    while (current.length <= lastSegment.value) {
      current.push(undefined);
    }
    current[lastSegment.value] = value;
  }

  return value;
}

function getValue(obj: any, segments: PathSegment[]): any {
  // Handle empty segments case
  if (segments.length === 0) {
    return obj;
  }

  let current = obj;

  for (const segment of segments) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }

    if (segment.type === "property") {
      current = current[segment.value];
    } else {
      if (!Array.isArray(current)) {
        return undefined;
      }
      current = current[segment.value as number];
    }
  }

  return current;
}
