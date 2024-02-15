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
    };
  };
  foo: string;
  buzz?: string;
}

const objectToMock: IMockObject = {
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

export default objectToMock;
