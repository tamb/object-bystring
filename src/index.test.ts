import byString from "./index";
import objectToMock from "./mocks";

let data: any;

describe("byString", () => {
  beforeEach(() => {
    data = objectToMock;
  });

  test("byString to be a function", () => {
    expect(byString).toBeInstanceOf(Function);
  });

  test("Reads string from object", () => {
    expect(byString(data, "foo")).toBe("bar");
  });

  test("writes new value to object", () => {
    expect(data.buzz).toBeUndefined();
    byString(data, "buzz", "fizz");
    expect(data.buzz).toBe("fizz");
  });

  test("String gets variable from object", () => {
    const firstName = byString(data, "name.first");
    expect(firstName).toBe("John");
  });

  test("String sets variable in object", () => {
    byString(data, "name.first", "James");
    expect(data.name.first).toBe("James");
  });

  test("String sets variable one deep", () => {
    byString(data, "people[0]", "Jeremy");
    if (data.people) {
      expect(data.people[0]).toMatch("Jeremy");
    }
  });

  test("String sets variable two deep", () => {
    byString(data, "place.address.city", "Chicago");
    expect(data.place.address.city).toMatch("Chicago");
  });

  test("Adds value to object", () => {
    expect(data.place.address.county).toBeUndefined();
    byString(data, "place.address.county", "Cook");
    expect(data.place.address.county).toMatch("Cook");
  });

  test("Adds field to object", () => {
    expect(data.foobar?.baz).toBeUndefined();
    byString(data, "foobar.baz", "Buzz");
    expect(byString(data, "foobar.baz")).toMatch("Buzz");
  });

  test("Sets date to object", () => {
    byString(data, "place.address.date", new Date());
    expect(data.place.address.date).toBeInstanceOf(Date);
  });

  test("Adds value to array", () => {
    expect(data.people).toHaveLength(1);
    byString(data, "people[1]", "Jill");
    expect(data.people).toHaveLength(2);
    expect(data.people[1]).toMatch("Jill");
  });

  test("Sets value to array", () => {
    byString(data, "people[2]", "Jill");
    // @ts-ignore
    expect(data.people[2]).toMatch("Jill");
  });
});
