const rimraf = require("rimraf");

// delete files and directories
const cleanProject = () => {
  try {
    rimraf.sync("*.tgz");
    console.log("deleted packed");
  } catch (err) {
    console.error(err);
  }
  try {
    rimraf.sync("dist");
    console.log("deleted dist");
  } catch (err) {
    console.error(err);
  }
  try {
    rimraf.sync("examples/node_modules");
    console.log("deleted example node_modules");
  } catch (err) {
    console.error(err);
  }
  try {
    rimraf.sync("examples/package-lock.json");
    console.log("deleted package-lock.json");
  } catch (err) {
    console.error(err);
  }
};
