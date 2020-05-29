require("./../dist/polyfill");
const byString = require("./../dist");

console.log(byString);

const obj = {
  name: {
    first: "John",
    last: "Doe",
    nickNames: ["JD", "John-Boy"],
  },
};

console.log("GET -> First Name: ", obj.byString("name.first"));
console.log(
  "SET -> First Name to Steve: ",
  obj.byString("name.first", "Steve")
);
console.log("GET -> New First Name: ", obj.byString("name.first"));
console.log("GET -> 2nd Nickname: ", obj.byString("name.nickNames[1]"));
console.log(
  "SET -> 2nd Nickname: ",
  Object.byString("name.nickNames[1]", "Snake-Boy", obj)
);
console.log("GET -> New 2nd Nickname: ", obj.byString("name.nickNames[1]"));

console.log("GET -> First Name: ", byString(obj, "name.first"));
console.log(
  "SET -> First Name to James: ",
  byString(obj, "name.first", "James")
);
console.log("GET -> New First Name: ", byString(obj, "name.first"));
console.log("GET -> 2nd Nickname: ", byString(obj, "name.nickNames[1]"));
console.log(
  "SET -> 2nd Nickname: ",
  byString(obj, "name.nickNames[1]", "Jay-mo")
);
console.log("GET -> New 2nd Nickname: ", byString(obj, "name.nickNames[1]"));
