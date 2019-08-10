const byString = require("./util-version.js").byString;
const mocks = require("./mocks");

test("Object prototype remains unchanged", () => {
  expect(Object.prototype.byString).not.toBeDefined();
});

test("byString to be a function", () => {
  expect(byString).toBeInstanceOf(Function);
});
