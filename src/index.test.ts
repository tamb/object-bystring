import byString from "./index";
import objectToMock from "./mocks";

describe("byString", () => {
  test("byString to be a function", () => {
    expect(byString).toBeInstanceOf(Function);
  });

  test("Reads string from object", () => {
    expect(byString(objectToMock, "foo")).toBe("bar");
  });

  test("writes new value to object", () => {
    expect(objectToMock.buzz).toBeUndefined();
    byString(objectToMock, "buzz", "fizz");
    expect(objectToMock.buzz).toBe("fizz");
  });

  test("String gets variable from object", () => {
    const firstName = byString(objectToMock, "name.first");
    expect(firstName).toBe("John");
  });

  test("String sets variable in object", () => {
    byString(objectToMock, "name.first", "James");
    expect(objectToMock.name.first).toBe("James");
  });

  test("String sets variable one deep", () => {
    byString(objectToMock, "people[0]", "Jeremy");
    if (objectToMock.people) {
      expect(objectToMock.people[0]).toMatch("Jeremy");
    }
  });

  test("String sets variable two deep", () => {
    byString(objectToMock, "place.address.city", "Chicago");
    expect(objectToMock.place.address.city).toMatch("Chicago");
  });

  test("Adds value to object", () => {
    byString(objectToMock, "place.address.county", "Cook");
    expect(objectToMock.place.address.county).toMatch("Cook");
  });

  test("Sets date to object", () => {
    byString(objectToMock, "place.address.date", new Date());
    expect(objectToMock.place.address.date).toBeInstanceOf(Date);
  });
});
