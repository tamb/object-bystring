require("./polyfill.js");
const mockObject = require("./mocks").mockObject;

test("Polyfill adds function to Object prototype", () => {
  expect(Object.prototype.byString).toBeInstanceOf(Function);
});

test("String gets variable from object", () => {
  const firstName = mockObject.byString("name.first");
  expect(firstName).toBe("John");
});

test("String sets variable in object", () => {
  mockObject.byString("name.first", "James");
  expect(mockObject.byString("name.first")).toBe("James");
});

test("String sets variable one deep", () => {
  mockObject.byString("people[1].name", "Jeremy");
  expect(mockObject.people).toBe("Jeremy");
});
