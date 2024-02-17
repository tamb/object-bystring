import byString from "./index";

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
