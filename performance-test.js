const byStringOptimized = require("./dist/index.js");
const byStringOriginal = require("./dist/original.js");

// Performance test to compare old vs new implementation
function performanceTest() {
  const iterations = 1000000;

  console.log(`Running performance test with ${iterations} iterations...\n`);

  // Test optimized version
  console.log("=== OPTIMIZED VERSION ===");
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

  const optimizedSetTime = setEnd1 - setStart1;
  const optimizedGetTime = getEnd1 - getStart1;
  const optimizedTotalTime = getEnd1 - setStart1;

  console.log(`Setting values: ${optimizedSetTime.toFixed(2)}ms`);
  console.log(`Getting values: ${optimizedGetTime.toFixed(2)}ms`);
  console.log(`Total time: ${optimizedTotalTime.toFixed(2)}ms`);

  // Test original version
  console.log("\n=== ORIGINAL VERSION ===");
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

  const originalSetTime = setEnd2 - setStart2;
  const originalGetTime = getEnd2 - getStart2;
  const originalTotalTime = getEnd2 - setStart2;

  console.log(`Setting values: ${originalSetTime.toFixed(2)}ms`);
  console.log(`Getting values: ${originalGetTime.toFixed(2)}ms`);
  console.log(`Total time: ${originalTotalTime.toFixed(2)}ms`);

  // Performance comparison
  console.log("\n=== PERFORMANCE COMPARISON ===");
  const setImprovement = (
    ((originalSetTime - optimizedSetTime) / originalSetTime) *
    100
  ).toFixed(2);
  const getImprovement = (
    ((originalGetTime - optimizedGetTime) / originalGetTime) *
    100
  ).toFixed(2);
  const totalImprovement = (
    ((originalTotalTime - optimizedTotalTime) / originalTotalTime) *
    100
  ).toFixed(2);

  console.log(`Setting improvement: ${setImprovement}% faster`);
  console.log(`Getting improvement: ${getImprovement}% faster`);
  console.log(`Total improvement: ${totalImprovement}% faster`);

  // Verify functionality
  console.log("\n=== FUNCTIONALITY VERIFICATION ===");
  console.log(
    `Optimized - level1.level2.level3[0]:`,
    byStringOptimized(testObj1, "level1.level2.level3[0]")
  );
  console.log(
    `Original - level1.level2.level3[0]:`,
    byStringOriginal(testObj2, "level1.level2.level3[0]")
  );
  console.log(
    `Optimized - level1.level2.level3[5]:`,
    byStringOptimized(testObj1, "level1.level2.level3[5]")
  );
  console.log(
    `Original - level1.level2.level3[5]:`,
    byStringOriginal(testObj2, "level1.level2.level3[5]")
  );
}

performanceTest();
