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
  case "upload":
    Deploy.uploadFile();
    break;
  case "fullDeploy":
    Deploy.fullDeploy();
    break;
  case "start":
    Deploy.start();
    break;
  case "logs":
    Deploy.logs();
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
  case "setup":
    Deploy.setupEnvironment();
    break;
  default:
    console.log("Command doesn't exists.");
}
