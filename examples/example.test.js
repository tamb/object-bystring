require("object-bystring/dist/polyfill");
const byString = require("object-bystring");

const { describe, it, expect } = require("@jest/globals");

describe("Polyfill", () => {
  const obj = {
    name: {
      first: "John",
      last: "Doe",
      nickNames: ["JD", "John-Boy"],
    },
    abc: 123,
    xyz: [4, 5, 6],
  };

  it("Gets the correct array index", () => {
    expect(obj.byString("xyz[1]")).toBe(5);
  });

  it("Gets the correct root key value", () => {
    expect(obj.byString("abc")).toBe(123);
  });

  it("Gets the correct object", () => {
    const name = obj.byString("name");

    expect(name).toHaveProperty("first");
    expect(name).toHaveProperty("last");
    expect(name.first).toMatch("John");
    expect(name.last).toMatch("Doe");
    expect(name).toHaveProperty("nickNames");
    expect(name.nickNames).toHaveLength(2);
  });

  it("Sets the correct array index", () => {
    obj.byString("xyz[0]", 79);
    obj.byString("xyz[2]", 99);
    expect(obj.xyz[0]).toBe(79);
    expect(obj.xyz[1]).toBe(5);
    expect(obj.xyz[2]).toBe(99);
  });

  it("Sets the correct root key value", () => {
    obj.byString("abc", 54);
    expect(obj.abc).toBe(54);
  });

  it("Sets the correct object", () => {
    obj.byString("name", {
      fart: true,
      smelly: false,
      type: "loud",
    });

    expect(obj.name).toHaveProperty("fart");
    expect(obj.name).not.toHaveProperty("smell");
    expect(obj.name).toHaveProperty("smelly");
    expect(obj.name).toHaveProperty("type");
    expect(obj.name.fart).toBe(true);
    expect(obj.name.smelly).toBe(false);
    expect(obj.name.type).toMatch("loud");
  });
});

describe("byString function", () => {
  const obj = {
    name: {
      first: "John",
      last: "Doe",
      nickNames: ["JD", "John-Boy"],
    },
    abc: 123,
    xyz: [4, 5, 6],
  };

  it("Gets the correct array index", () => {
    expect(byString(obj, "xyz[1]")).toBe(5);
  });

  it("Gets the correct root key value", () => {
    expect(byString(obj, "abc")).toBe(123);
  });

  it("Gets the correct object", () => {
    const name = byString(obj, "name");

    expect(name).toHaveProperty("first");
    expect(name).toHaveProperty("last");
    expect(name.first).toMatch("John");
    expect(name.last).toMatch("Doe");
    expect(name).toHaveProperty("nickNames");
    expect(name.nickNames).toHaveLength(2);
  });

  it("Sets the correct array index", () => {
    byString(obj, "xyz[0]", 79);
    byString(obj, "xyz[2]", 99);
    expect(obj.xyz[0]).toBe(79);
    expect(obj.xyz[1]).toBe(5);
    expect(obj.xyz[2]).toBe(99);
  });

  it("Sets the correct root key value", () => {
    byString(obj, "abc", 54);
    expect(obj.abc).toBe(54);
  });

  it("Sets the correct object", () => {
    byString(obj, "name", {
      fart: true,
      smelly: false,
      type: "loud",
    });

    expect(obj.name).toHaveProperty("fart");
    expect(obj.name).not.toHaveProperty("smell");
    expect(obj.name).toHaveProperty("smelly");
    expect(obj.name).toHaveProperty("type");
    expect(obj.name.fart).toBe(true);
    expect(obj.name.smelly).toBe(false);
    expect(obj.name.type).toMatch("loud");
  });
});
