const byString = require("./../dist/index.js");
const mockObject = require("./mocks").mockObject;

test("Object prototype remains unchanged", () => {
  expect(Object.prototype.byString).not.toBeDefined();
});

test("byString to be a function", () => {
  expect(byString).toBeInstanceOf(Function);
});

test("String gets variable from object", () => {
  const firstName = byString(mockObject, "name.first");
  expect(firstName).toBe("John");
});

test("String sets variable in object", () => {
  byString(mockObject, "name.first", "James");
  expect(mockObject.name.first).toBe("James");
});

test("String sets variable one deep", () => {
  byString(mockObject, "people[1].name", "Jeremy");
  expect(mockObject.people).toBe("Jeremy");
});
