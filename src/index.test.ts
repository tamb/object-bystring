import byString from "./index";

// Import the helper functions for unit testing
// We'll need to export them temporarily for testing
// For now, let's test them through the main function and create separate test cases

interface IMockObject {
  name: {
    first: string;
    last: string;
    nickNames: string[];
  };
  people?: string[];
  place: {
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      county?: string;
      date?: Date;
      $city?: string;
    };
  };
  foo: string;
  buzz?: string;
  foobar?: {
    baz?: string;
  };
}

let data: IMockObject;

// Unit tests for parseKey function behavior
describe("parseKey function unit tests", () => {
  test("parses simple property path", () => {
    const result = byString({}, "foo", "bar");
    expect(result).toBe("bar");
  });

  test("parses nested property path", () => {
    const result = byString({}, "level1.level2.level3", "value");
    expect(result).toBe("value");
  });

  test("parses array index", () => {
    const result = byString({}, "array[0]", "value");
    expect(result).toBe("value");
  });

  test("parses mixed path with array and properties", () => {
    const result = byString({}, "users[0].name.first", "John");
    expect(result).toBe("John");
  });

  test("parses multiple array indices", () => {
    const result = byString({}, "matrix[0][1][2]", "value");
    expect(result).toBe("value");
  });

  test("parses path with special characters in property names", () => {
    const result = byString({}, "user.$id.name", "John");
    expect(result).toBe("John");
  });

  test("parses empty array index", () => {
    const result = byString({}, "array[]", "value");
    // Should handle gracefully - will create array with undefined at index 0
    expect(result).toBe("value");
  });

  test("parses complex nested path", () => {
    const result = byString(
      {},
      "data.users[0].profile.settings[1].theme",
      "dark"
    );
    expect(result).toBe("dark");
  });
});

// Unit tests for setValue function behavior
describe("setValue function unit tests", () => {
  test("sets value on empty object", () => {
    const obj: any = {};
    const result = byString(obj, "foo", "bar");
    expect(result).toBe("bar");
    expect(obj.foo).toBe("bar");
  });

  test("creates nested objects automatically", () => {
    const obj: any = {};
    const result = byString(obj, "level1.level2.level3", "value");
    expect(result).toBe("value");
    expect(obj.level1.level2.level3).toBe("value");
  });

  test("creates arrays automatically", () => {
    const obj: any = {};
    const result = byString(obj, "array[5]", "value");
    expect(result).toBe("value");
    expect(Array.isArray(obj.array)).toBe(true);
    expect(obj.array[5]).toBe("value");
    expect(obj.array.length).toBe(6);
  });

  test("extends existing arrays", () => {
    const obj = { array: [1, 2, 3] };
    const result = byString(obj, "array[5]", "value");
    expect(result).toBe("value");
    expect(obj.array.length).toBe(6);
    expect(obj.array[5]).toBe("value");
    expect(obj.array[3]).toBeUndefined();
    expect(obj.array[4]).toBeUndefined();
  });

  test("sets value in existing nested structure", () => {
    const obj: any = { level1: { level2: { existing: "old" } } };
    const result = byString(obj, "level1.level2.new", "value");
    expect(result).toBe("value");
    expect(obj.level1.level2.new).toBe("value");
    expect(obj.level1.level2.existing).toBe("old");
  });

  test("handles mixed object and array creation", () => {
    const obj: any = {};
    const result = byString(obj, "users[0].name", "John");
    expect(result).toBe("John");
    expect(Array.isArray(obj.users)).toBe(true);
    expect(typeof obj.users[0]).toBe("object");
    expect(obj.users[0].name).toBe("John");
  });

  test("sets multiple values in same array", () => {
    const obj: any = {};
    byString(obj, "array[0]", "first");
    byString(obj, "array[2]", "third");
    expect(obj.array[0]).toBe("first");
    expect(obj.array[2]).toBe("third");
    expect(obj.array[1]).toBeUndefined();
    expect(obj.array.length).toBe(3);
  });

  test("overwrites existing values", () => {
    const obj: any = { existing: "old" };
    const result = byString(obj, "existing", "new");
    expect(result).toBe("new");
    expect(obj.existing).toBe("new");
  });
});

// Unit tests for getValue function behavior
describe("getValue function unit tests", () => {
  test("gets value from simple property", () => {
    const obj = { foo: "bar" };
    const result = byString(obj, "foo");
    expect(result).toBe("bar");
  });

  test("gets value from nested property", () => {
    const obj = { level1: { level2: { level3: "value" } } };
    const result = byString(obj, "level1.level2.level3");
    expect(result).toBe("value");
  });

  test("gets value from array index", () => {
    const obj = { array: ["first", "second", "third"] };
    const result = byString(obj, "array[1]");
    expect(result).toBe("second");
  });

  test("returns undefined for non-existent property", () => {
    const obj = { existing: "value" };
    const result = byString(obj, "nonExistent");
    expect(result).toBeUndefined();
  });

  test("returns undefined for non-existent nested property", () => {
    const obj = { level1: { existing: "value" } };
    const result = byString(obj, "level1.nonExistent");
    expect(result).toBeUndefined();
  });

  test("returns undefined for non-existent array index", () => {
    const obj = { array: ["first", "second"] };
    const result = byString(obj, "array[5]");
    expect(result).toBeUndefined();
  });

  test("returns undefined when accessing property on non-object", () => {
    const obj = { string: "not an object" };
    const result = byString(obj, "string.property");
    expect(result).toBeUndefined();
  });

  test("returns undefined when accessing array index on non-array", () => {
    const obj = { notArray: "string" };
    const result = byString(obj, "notArray[0]");
    expect(result).toBeUndefined();
  });

  test("gets value from mixed path", () => {
    const obj = { users: [{ name: "John" }] };
    const result = byString(obj, "users[0].name");
    expect(result).toBe("John");
  });

  test("handles null and undefined gracefully", () => {
    const obj = { nullValue: null, undefinedValue: undefined };
    expect(byString(obj, "nullValue")).toBeNull();
    expect(byString(obj, "undefinedValue")).toBeUndefined();
    expect(byString(obj, "nullValue.property")).toBeUndefined();
  });

  test("gets value from deeply nested structure", () => {
    const obj = {
      data: {
        users: [
          {
            profile: {
              settings: {
                theme: "dark",
              },
            },
          },
        ],
      },
    };
    const result = byString(obj, "data.users[0].profile.settings.theme");
    expect(result).toBe("dark");
  });
});

// Edge case tests
describe("Edge cases and error handling", () => {
  test("handles empty string key", () => {
    const obj: any = {};
    const result = byString(obj, "", "value");
    expect(result).toBe("value");
    expect(obj[""]).toBe("value");
  });

  test("handles key with only dots", () => {
    const obj: any = {};
    const result = byString(obj, "...", "value");
    expect(result).toBe("value");
    expect(obj[""]).toBe("value");
  });

  test("handles malformed array syntax", () => {
    const obj: any = {};
    const result = byString(obj, "array[", "value");
    expect(result).toBe("value");
    expect(obj.array).toBe("value");
  });

  test("handles non-numeric array indices", () => {
    const obj: any = {};
    const result = byString(obj, "array[abc]", "value");
    expect(result).toBe("value");
    expect(obj.array).toBe("value");
  });

  test("handles very large array indices", () => {
    const obj: any = {};
    const result = byString(obj, "array[999999]", "value");
    expect(result).toBe("value");
    expect(obj.array[999999]).toBe("value");
    expect(obj.array.length).toBe(1000000);
  });

  test("handles special characters in property names", () => {
    const obj: any = {};
    const result = byString(obj, "user-name", "value");
    expect(result).toBe("value");
    expect(obj["user-name"]).toBe("value");
  });

  test("handles unicode characters", () => {
    const obj: any = {};
    const result = byString(obj, "user.名字", "value");
    expect(result).toBe("value");
    expect(obj.user.名字).toBe("value");
  });
});

describe("byString setters", () => {
  beforeEach(() => {
    data = {
      name: {
        first: "John",
        last: "Doe",
        nickNames: ["JD", "John-Boy"],
      },
      people: [],
      place: {
        address: {
          street: "1234 Elm St",
          city: "Springfield",
          state: "IL",
          zip: "62704",
        },
      },
      foo: "bar",
    };
  });

  test("byString to be a function", () => {
    expect(byString).toBeInstanceOf(Function);
  });

  test("writes new value to object", () => {
    expect(data.buzz).toBeUndefined();
    byString(data, "buzz", "fizz");
    expect(data.buzz).toBe("fizz");
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
    expect(data.foobar?.baz).toMatch("Buzz");
  });

  test("Accepts $ in key", () => {
    byString(data, "place.address.$city", "Chicago");
    expect(data.place.address.$city).toMatch("Chicago");
  });

  test("Sets date to object", () => {
    byString(data, "place.address.date", new Date());
    expect(data.place.address.date).toBeInstanceOf(Date);
  });

  test("Adds length to array", () => {
    expect(data.people).toHaveLength(0);
    byString(data, "people[0]", "Jill");
    expect(data.people).toHaveLength(1);
  });

  test("Sets value to array", () => {
    byString(data, "people[0]", "Jill");
    // @ts-ignore
    expect(data.people[0]).toMatch("Jill");
  });

  test("Adds value to correct index", () => {
    byString(data, "people[1]", "Jack");
    // @ts-ignore
    expect(data.people[1]).toMatch("Jack");
    expect(data.people).toHaveLength(2);
  });

  test("Adds empty array entries", () => {
    byString(data, "people[3]", "Jill");
    // @ts-ignore
    expect(data.people[3]).toMatch("Jill");
    expect(data.people).toHaveLength(4);
    // @ts-ignore
    expect(data.people[2]).toBeUndefined();
  });

  test("Setting array values does not affect other array values", () => {
    byString(data, "people[0]", "Jill");
    byString(data, "people[4]", "Jack");
    // @ts-ignore
    expect(data.people[0]).toMatch("Jill");
    // @ts-ignore
    expect(data.people).toHaveLength(5);
    // @ts-ignore
    expect(data.people[1]).toBeUndefined();
  });

  test("Setting array values for non-existent array works", () => {
    byString(data, "losers[1]", "Jill");
    // @ts-ignore
    expect(data.losers[1]).toMatch("Jill");
    // @ts-ignore
    expect(data.losers).toHaveLength(2);
    // @ts-ignore
    expect(data.losers[0]).toBeUndefined();
  });
});

describe("byString getters", () => {
  beforeEach(() => {
    data = {
      name: {
        first: "John",
        last: "Doe",
        nickNames: ["JD", "John-Boy"],
      },
      people: [],
      place: {
        address: {
          street: "1234 Elm St",
          city: "Springfield",
          state: "IL",
          zip: "62704",
        },
      },
      foo: "bar",
    };
  });

  test("Reads string from object", () => {
    expect(byString(data, "foo")).toBe("bar");
  });

  test("String gets variable from object", () => {
    const firstName = byString(data, "name.first");
    expect(firstName).toBe("John");
  });

  test("String gets variable one deep", () => {
    byString(data, "people[0]", "Jeremy");
    const person = byString(data, "people[0]");
    expect(person).toMatch("Jeremy");
  });

  test("String gets variable two deep", () => {
    byString(data, "place.address.city", "Chicago");
    const city = byString(data, "place.address.city");
    expect(city).toMatch("Chicago");
  });

  test("Returns undefined for non-existent field", () => {
    const county = byString(data, "place.address.county");
    expect(county).toBeUndefined();
  });

  test("Returns undefined for doubly non-existent field", () => {
    const county = byString(data, "place.address.county.seat");
    expect(county).toBeUndefined();
  });

  test("Gets undefined for non-existent array index", () => {
    const person = byString(data, "people[0]");
    expect(person).toBeUndefined();
  });

  test("Gets undefined for non-existent array index", () => {
    byString(data, "people[1]", "Jeremy");
    const person = byString(data, "people[0]");
    expect(person).toBeUndefined();
  });
});
