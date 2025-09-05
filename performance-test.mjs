import { byString as byStringOptimized } from "./dist/index.esm.js";
import { byStringOriginal } from "./dist/original.esm.js";
import { byString as byStringV7 } from "./dist/v7.esm.js";

// Performance test to compare implementations
function performanceTest() {
  const iterations = 5000000;

  console.log(
    `🚀 Running performance test with ${iterations.toLocaleString()} iterations\n`
  );

  const results = {};

  // Test optimized version
  const testObj1 = {};
  const setStart1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    byStringOptimized(testObj1, `level1.level2.level3[${i % 10}]`, `value${i}`);
  }
  const setEnd1 = performance.now();
  const getStart1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    byStringOptimized(testObj1, `level1.level2.level3[${i % 10}]`);
  }
  const getEnd1 = performance.now();

  results.optimized = {
    set: setEnd1 - setStart1,
    get: getEnd1 - getStart1,
    total: getEnd1 - setStart1,
  };

  // Test original version
  const testObj2 = {};
  const setStart2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    byStringOriginal(testObj2, `level1.level2.level3[${i % 10}]`, `value${i}`);
  }
  const setEnd2 = performance.now();
  const getStart2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    byStringOriginal(testObj2, `level1.level2.level3[${i % 10}]`);
  }
  const getEnd2 = performance.now();

  results.original = {
    set: setEnd2 - setStart2,
    get: getEnd2 - getStart2,
    total: getEnd2 - setStart2,
  };

  // Test v7 version
  const testObj3 = {};
  const setStart3 = performance.now();
  for (let i = 0; i < iterations; i++) {
    byStringV7(testObj3, `level1.level2.level3[${i % 10}]`, `value${i}`);
  }
  const setEnd3 = performance.now();
  const getStart3 = performance.now();
  for (let i = 0; i < iterations; i++) {
    byStringV7(testObj3, `level1.level2.level3[${i % 10}]`);
  }
  const getEnd3 = performance.now();

  results.v7 = {
    set: setEnd3 - setStart3,
    get: getEnd3 - getStart3,
    total: getEnd3 - setStart3,
  };

  // Display results table
  console.log("📊 PERFORMANCE RESULTS");
  console.log("═".repeat(72));

  const performanceTable = {};
  Object.entries(results).forEach(([version, times]) => {
    const name = version.charAt(0).toUpperCase() + version.slice(1);
    performanceTable[name] = {
      "Set (ms)": times.set.toFixed(2),
      "Get (ms)": times.get.toFixed(2),
      "Total (ms)": times.total.toFixed(2),
    };
  });

  console.table(performanceTable);
  console.log();

  // Performance improvements table
  console.log("📈 PERFORMANCE IMPROVEMENTS (vs Original)");
  console.log("═".repeat(58));

  const improvementsTable = {};
  Object.entries(results).forEach(([version, times]) => {
    if (version === "original") return;

    const setImprovement =
      ((results.original.set - times.set) / results.original.set) * 100;
    const getImprovement =
      ((results.original.get - times.get) / results.original.get) * 100;
    const totalImprovement =
      ((results.original.total - times.total) / results.original.total) * 100;

    const name = version.charAt(0).toUpperCase() + version.slice(1);
    improvementsTable[name] = {
      Set: (setImprovement > 0 ? "+" : "") + setImprovement.toFixed(1) + "%",
      Get: (getImprovement > 0 ? "+" : "") + getImprovement.toFixed(1) + "%",
      Total:
        (totalImprovement > 0 ? "+" : "") + totalImprovement.toFixed(1) + "%",
    };
  });

  console.table(improvementsTable);
  console.log();

  // Head-to-head comparison
  console.log("⚡ HEAD-TO-HEAD COMPARISON");
  console.log("═".repeat(50));

  const optimizedVsV7Set =
    ((results.v7.set - results.optimized.set) / results.v7.set) * 100;
  const optimizedVsV7Get =
    ((results.v7.get - results.optimized.get) / results.v7.get) * 100;
  const optimizedVsV7Total =
    ((results.v7.total - results.optimized.total) / results.v7.total) * 100;

  const comparisonTable = {
    "Optimized vs V7": {
      Set:
        (optimizedVsV7Set > 0 ? "+" : "") + optimizedVsV7Set.toFixed(1) + "%",
      Get:
        (optimizedVsV7Get > 0 ? "+" : "") + optimizedVsV7Get.toFixed(1) + "%",
      Total:
        (optimizedVsV7Total > 0 ? "+" : "") +
        optimizedVsV7Total.toFixed(1) +
        "%",
    },
  };

  console.table(comparisonTable);
  console.log();

  // Verify functionality
  console.log("✅ FUNCTIONALITY VERIFICATION");
  console.log("-".repeat(40));

  console.log(
    `Optimized - level1.level2.level3[0]: ${byStringOptimized(
      testObj1,
      "level1.level2.level3[0]"
    )}`
  );
  console.log(
    `Original  - level1.level2.level3[0]: ${byStringOriginal(
      testObj2,
      "level1.level2.level3[0]"
    )}`
  );
  console.log(
    `V7        - level1.level2.level3[0]: ${byStringV7(
      testObj3,
      "level1.level2.level3[0]"
    )}`
  );
  console.log(
    `Optimized - level1.level2.level3[5]: ${byStringOptimized(
      testObj1,
      "level1.level2.level3[5]"
    )}`
  );
  console.log(
    `Original  - level1.level2.level3[5]: ${byStringOriginal(
      testObj2,
      "level1.level2.level3[5]"
    )}`
  );
  console.log(
    `V7        - level1.level2.level3[5]: ${byStringV7(
      testObj3,
      "level1.level2.level3[5]"
    )}`
  );
}

performanceTest();
