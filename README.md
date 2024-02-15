# object-bystring

Access and alter deeply nested object properties by string notation

## Purpose

Let's say you want to change a something nested in this object:

```js
var objA = {
  name: "tamb",
  address: {
    street: "123 fake street",
    town: "fake town",
    zip: "00000",
    state: "Fake State",
    city: "Fake City",
    POBoxes: [1234, 23213, 2321],
  },
  dependents: [
    {
      name: "John Doe",
      age: 55,
    },
    {
      name: "Jane Doe",
      age: 44,
    },
  ],
};
```

You coould easily write `objA.dependents[1].age = 45;`  
 Or even `var indx = 1; objA.dependents[indx].age = 45;`

No issue here.

But let's say you are trying to pass along an object (`objB`) of commands. Those commands should dictate what to change in `objA`.

How do you easily do this?

```js
{
 'address.street': '345 Faker Way',
 'dependents[1].age': 45,
 'address.POBoxes[2]': 43278
}
```

With `byString` you can generate paths to object values and either set or get those values.

## Latest Docs:

https://github.com/tamb/object-bystring

## Demo

https://codesandbox.io/embed/object-bystring-demo-i3845d?fontsize=14&hidenavigation=1&theme=dark

## installation

`npm install --save object-bystring`

## Usage

You can import either a utility method, or a polyfill to add this functionality to the `Object` prototype.

```js
// util method
const bystring = require("object-bystring");
import byString from "object-bystring";
```

Using the example above:

### Setting Values

#### `byString(object, key, value)`

```js
byString(objectA, "path.to.field", "new value");
```

### Getting Values

#### `byString(object, key);`

```js
const finger = byString(person, "arm[0].hand.fingers[3]");

const randomFinger = byString(person`arm[0].hand.fingers[${number}]`);
```

### Attribution

Thank you, Ray for the original Stackoverflow answer, which is the majority of the source code.
https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key

Check out his github and so profile below:

https://github.com/raybellis

https://stackoverflow.com/users/6782/alnitak
