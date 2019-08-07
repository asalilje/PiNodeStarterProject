const Deployment = require("./deployment.js");

const Deploy = new Deployment({
  hostName: "pi-ipnumber",
  projectName: "PiNodeStarterProject",
  user: "pi-user",
  password: "pi-password",
  files: ["app.js", "package.json"],
  startFile: "app.js "
});

var arg = process.argv.slice(2)[0];

switch (arg) {
  case "deploy":
    Deploy.deployProject();
    break;
  case "run":
    Deploy.run();
    break;
  case "modules":
    Deploy.restoreModules();
    break;
  case "stop":
    Deploy.stop();
    break;
  default:
    console.log("Command doesn't exists.");
}
