require("./index.js");

test("Polyfill adds function to Object prototype", () => {
  expect(Object.prototype.byString).toBeInstanceOf(Function);
});
