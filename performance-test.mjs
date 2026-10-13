import { byString } from "./dist/index.esm.js";
import { byStringV8 } from "./dist/v8.esm.js";

const iterations = Number(process.env.BENCHMARK_ITERATIONS ?? 500_000);
const rounds = Number(process.env.BENCHMARK_ROUNDS ?? 7);
const warmupIterations = Math.min(20_000, iterations);
let sink;

const benchmarks = [
  {
    name: "simple property get",
    create: (implementation) => {
      const object = { value: 1 };
      return () => implementation(object, "value");
    },
  },
  {
    name: "simple property set",
    create: (implementation) => {
      const object = { value: 0 };
      return (i) => implementation(object, "value", i);
    },
  },
  {
    name: "nested property get",
    create: (implementation) => {
      const object = { level1: { level2: { value: 1 } } };
      return () => implementation(object, "level1.level2.value");
    },
  },
  {
    name: "nested property set",
    create: (implementation) => {
      const object = { level1: { level2: { value: 0 } } };
      return (i) => implementation(object, "level1.level2.value", i);
    },
  },
  {
    name: "array index get",
    create: (implementation) => {
      const object = { values: [1] };
      return () => implementation(object, "values[0]");
    },
  },
  {
    name: "array index set",
    create: (implementation) => {
      const object = { values: [0] };
      return (i) => implementation(object, "values[0]", i);
    },
  },
  {
    name: "mixed path get",
    create: (implementation) => {
      const object = { level1: { values: [{ value: 1 }] } };
      return () => implementation(object, "level1.values[0].value");
    },
  },
  {
    name: "mixed path set",
    create: (implementation) => {
      const object = { level1: { values: [{ value: 0 }] } };
      return (i) => implementation(object, "level1.values[0].value", i);
    },
  },
  {
    name: "multiple array indices get",
    create: (implementation) => {
      const object = { matrix: [[[1]]] };
      return () => implementation(object, "matrix[0][0][0]");
    },
  },
  {
    name: "missing path get",
    create: (implementation) => {
      const object = { level1: {} };
      return () => implementation(object, "level1.missing.value");
    },
  },
  {
    name: "dynamic mixed path get",
    create: (implementation) => {
      const object = { level1: { level2: { values: Array(10).fill(1) } } };
      const keys = Array.from(
        { length: 10 },
        (_, index) => `level1.level2.values[${index}]`
      );
      return (i) => implementation(object, keys[i % keys.length]);
    },
  },
  {
    name: "dynamic mixed path set",
    create: (implementation) => {
      const object = { level1: { level2: { values: Array(10).fill(0) } } };
      const keys = Array.from(
        { length: 10 },
        (_, index) => `level1.level2.values[${index}]`
      );
      return (i) => implementation(object, keys[i % keys.length], i);
    },
  },
];

function measure(implementation, createOperation) {
  const operation = createOperation(implementation);

  for (let i = 0; i < warmupIterations; i++) sink = operation(i);

  const start = performance.now();
  for (let i = 0; i < iterations; i++) sink = operation(i);
  return performance.now() - start;
}

function median(values) {
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const results = [];

for (const benchmark of benchmarks) {
  const v8Times = [];
  const currentTimes = [];

  for (let round = 0; round < rounds; round++) {
    const implementations =
      round % 2 === 0
        ? [
            [byStringV8, v8Times],
            [byString, currentTimes],
          ]
        : [
            [byString, currentTimes],
            [byStringV8, v8Times],
          ];

    for (const [implementation, times] of implementations) {
      times.push(measure(implementation, benchmark.create));
    }
  }

  const v8Time = median(v8Times);
  const currentTime = median(currentTimes);
  results.push({
    benchmark: benchmark.name,
    v8Time,
    currentTime,
    improvement: ((v8Time - currentTime) / v8Time) * 100,
  });
}

console.log(
  `Performance comparison: ${iterations.toLocaleString()} iterations, ` +
    `${rounds} rounds (median)`
);
console.table(
  Object.fromEntries(
    results.map(({ benchmark, v8Time, currentTime, improvement }) => [
      benchmark,
      {
        "V8 (ms)": v8Time.toFixed(2),
        "Current (ms)": currentTime.toFixed(2),
        Improvement: `${improvement.toFixed(1)}%`,
      },
    ])
  )
);

const regressions = results.filter(({ improvement }) => improvement <= 0);
if (regressions.length > 0) {
  console.error(
    `Performance regression in: ${regressions
      .map(({ benchmark }) => benchmark)
      .join(", ")}`
  );
  process.exitCode = 1;
}
