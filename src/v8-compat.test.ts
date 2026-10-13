import { describe, test, expect } from "vitest";
import { byString } from "./index";
import { byString as byStringV8 } from "./v8";

type ByString = (obj: any, key: string, value?: any) => any;

function snapshot(v: any, seen = new Set<any>()): string {
  if (v === null || (typeof v !== "object" && typeof v !== "function")) {
    return typeof v === "string" ? JSON.stringify(v) : `${typeof v}:${v}`;
  }
  if (seen.has(v)) return "<cycle>";
  seen.add(v);
  const body = Reflect.ownKeys(v)
    .filter((k) => k !== "length")
    .map((k) => `${String(k)}=${snapshot(v[k], seen)}`)
    .join(",");
  return Array.isArray(v) ? `A${v.length}[${body}]` : `O{${body}}`;
}

// Wraps an object so every observable property operation is logged.
function recorder(target: any, log: string[], label = "$"): any {
  if (target === null || typeof target !== "object") return target;
  return new Proxy(target, {
    get(t, k, r) {
      log.push(`get ${label}.${String(k)}`);
      return recorder(Reflect.get(t, k, r), log, `${label}.${String(k)}`);
    },
    set(t, k, v, r) {
      log.push(`set ${label}.${String(k)}=${snapshot(v)}`);
      return Reflect.set(t, k, v, r);
    },
  });
}

const fixtures: Record<string, () => any> = {
  empty: () => ({}),
  populated: () => ({
    a: { b: [{ a: 1 }, ["x", null], "str"], "": { a: 2 }, "[0]": "lit" },
    b: [[[1]], { a: [0, 1] }],
    "": "empty",
    "-1": 4,
    0: "zero",
    nul: null,
    str: "hello",
  }),
  array: () => [{ a: [1, 2] }, [[3]], "s", null],
};

function observe(fn: ByString, make: () => any, key: string, args: any[]) {
  const log: string[] = [];
  const run = (root: any) => {
    try {
      const result = fn(root, key, ...args);
      return `return ${result === root ? "<root>" : snapshot(result)}`;
    } catch (e: any) {
      return `throw ${e?.constructor?.name}: ${e?.message}`;
    }
  };
  const plainRoot = make();
  const plain = run(plainRoot);
  const proxied = run(recorder(make(), log));
  return { plain, tree: snapshot(plainRoot), proxied, log };
}

function* keys(): Generator<string> {
  const alphabet = [".", "[", "]", "a", "b", "0", "1", "-"];
  let layer = [""];
  yield "";
  for (let length = 1; length <= 4; length++) {
    layer = layer.flatMap((prefix) => alphabet.map((c) => prefix + c));
    yield* layer;
  }
  const indices = [
    "[]",
    "[3]",
    "[12]",
    "[-1]",
    "[-0]",
    "[01]",
    "[abc]",
    "[1e3]",
    "[ 1]",
    "[+1]",
    "[1.5]",
    "[123456789012345]",
    "[1234567890123456]",
    "[9007199254740992]",
    "[9007199254740993]",
    "[99999999999999999999]",
    "[4294967295]",
  ];
  for (const index of indices) {
    yield `a${index}`;
    yield `a${index}.b`;
    yield `a.b${index}[0]`;
    yield `${index}`;
  }
  yield "matrix[0][1][2]";
  yield "a..b";
  yield "a.[0]";
  yield "a[0].";
  yield "user.名字";
}

describe("compatibility with v8.0.0", () => {
  test("matches v8.0.0 results, trees, errors and property access order", () => {
    let compared = 0;
    for (const key of keys()) {
      for (const make of Object.values(fixtures)) {
        for (const args of [[], ["V"], [null]]) {
          const expected = observe(byStringV8, make, key, args);
          const actual = observe(byString, make, key, args);
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            expect({ key, args, ...actual }).toEqual({
              key,
              args,
              ...expected,
            });
          }
          compared++;
        }
      }
    }
    expect(compared).toBeGreaterThan(40000);
  });
});
