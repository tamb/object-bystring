# object-bystring

Access and alter deeply nested object properties by string notation

## Purpose

Let's say you want to change a something nested in this object:

```js
var objA = {
  name: "tamb",
  address: {
    street: "123 fake street",
    town: "fake town",
    zip: "00000",
    state: "Fake State",
    city: "Fake City",
    POBoxes: [1234, 23213, 2321],
  },
  dependents: [
    {
      name: "John Doe",
      age: 55,
    },
    {
      name: "Jane Doe",
      age: 44,
    },
  ],
};
```

You coould easily write `objA.dependents[1].age = 45;`  
 Or even `var indx = 1; objA.dependents[indx].age = 45;`

No issue here.

But let's say you are trying to pass along an object (`objB`) of commands. Those commands should dictate what to change in `objA`.

How do you easily do this?

```js
{
 'address.street': '345 Faker Way',
 'dependents[1].age': 45,
 'address.POBoxes[2]': 43278
}
```

With `byString` you can generate paths to object values and either set or get those values.

## Latest Docs:

https://github.com/tamb/object-bystring

## Demo

https://codesandbox.io/embed/object-bystring-demo-i3845d?fontsize=14&hidenavigation=1&theme=dark

## installation

`npm install --save object-bystring`

## Usage

You can import either a utility method, or a polyfill to add this functionality to the `Object` prototype.

```js
// util method
const { bystring } = require("object-bystring");
import { byString } from "object-bystring";
```

Using the example above:

### Setting Values

#### `byString(object, key, value)`

```js
byString(objectA, "path.to.field", "new value");
```

setting values for fields that don't exist will add them to the object.
Setting values for array indexes that don't exist will add them to the array and other indexes will be undefined.

````js

### Getting Values

#### `byString(object, key);`

```js
const finger = byString(person, "arm[0].hand.fingers[3]");

const randomFinger = byString(person`arm[0].hand.fingers[${number}]`);
````

Getting values for fields that don't exist will return `undefined`.

### Performance & Optimization History

The `byString` function has undergone significant optimizations across multiple versions:

#### **v8.0.1 (Current) - Compiled Accessors & Path Caching**

v8.0.1 delivers an additional **~61% performance improvement** across the board over v8.0.0 and **~77% improvement** over the original version (5,000,000 iterations):

| Version    | Set (ms)  | Get (ms)  | Total (ms)  | vs V8 (8.0.0)    | vs Original      |
| ---------- | --------- | --------- | ----------- | ---------------- | ---------------- |
| Original   | 2,846ms   | 2,979ms   | 5,825ms     | -                | -                |
| V7         | 2,427ms   | 2,104ms   | 4,531ms     | -                | **22.2% faster** |
| V8 (8.0.0) | 1,884ms   | 1,574ms   | 3,459ms     | -                | **40.6% faster** |
| **v8.0.1** | **740ms** | **587ms** | **1,328ms** | **61.6% faster** | **77.2% faster** |

**v8.0.1 Key Optimizations (Non-Breaking):**

- Bounded compiled accessor path cache (`Map` with bounded capacity)
- Specialized unrolled getter and setter accessors for common depths (1–4) and fast loop fallback
- Zero-allocation integer index parsing from char codes
- Complete separation of getter and setter paths eliminating runtime conditional checks
- 100% backward-compatible with all existing tests and behavior

#### **V8.0.0 - Inline Algorithm**

V8 delivered initial inline zero-allocation improvements:

| Version  | Time         | vs Original       | vs V7             |
| -------- | ------------ | ----------------- | ----------------- |
| Original | 1,034.04ms   | -                 | -                 |
| V7       | 543.41ms     | **47.46% faster** | -                 |
| **V8**   | **211.45ms** | **79.55% faster** | **61.09% faster** |

**V8 Key Optimizations:**

- Single-pass inline algorithm
- Eliminated helper functions and intermediate objects
- Direct array/object creation and navigation
- Optimized peek-ahead logic for type determination
- Minimal string slicing operations

#### **V7 Optimizations**

V7 introduced modular architecture with:

- Character-by-character parser (replaced regex)
- Separated concerns (`parseKey`, `setValue`, `getValue`)
- Enhanced TypeScript support and type safety
- Better error handling and edge case coverage

#### **Breaking Changes in V8**

⚠️ **Important**: V8 introduces breaking changes for edge cases:

**1. Malformed Array Syntax**

```js
// Before (Original/V7): Creates nested property
byString(obj, "array[", "value");
// Result: obj.array["["] = "value"

// After (V8): Creates literal property name
byString(obj, "array[", "value");
// Result: obj["array["] = "value"
```

**2. Non-numeric Array Indices**

```js
// Before (Original/V7): Creates nested property
byString(obj, "array[abc]", "value");
// Result: obj.array["[abc]"] = "value"

// After (V8): Creates literal property name
byString(obj, "array[abc]", "value");
// Result: obj["array[abc]"] = "value"
```

**Impact**: These changes affect only malformed or non-standard syntax. Valid array notation (`array[0]`, `array[123]`) and object notation (`obj.prop`) work identically.

**Recommendation**: Use proper syntax (`array[0]` for arrays, `obj.prop` for objects) to avoid these edge cases.

### Attribution

Thank you, Ray for the original Stackoverflow answer, which is the inspiration for this project.
https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key

Check out his github and so profile below:

https://github.com/raybellis

https://stackoverflow.com/users/6782/alnitak
