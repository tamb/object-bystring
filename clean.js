const rimraf = require("rimraf");

rimraf("*.tgz", () => console.log("deleted packed file"));
rimraf("dist", () => console.log("deleted dist"));
rimraf("examples/node_modules", () =>
  console.log("deleted example node_modules")
);
rimraf("examples/package-lock.json", () =>
  console.log("deleted package-lock.json")
);
