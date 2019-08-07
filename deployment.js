"use strict";

var ssh2Client = require("ssh2").Client;
var exec = require("child_process").exec;

class Deployment {
  constructor(config) {
    this.projectName = config.projectName;
    this.root = "/home/" + config.user + "/" + config.projectName;
    this.user = config.user;
    this.password = config.password;
    this.hostName = config.hostName;
    this.files = config.files;
    this.startFile = config.startFile;
  }

  executeRemote(command) {
    return new Promise((resolve, reject) => {
      const ssh2client = new ssh2Client();
      const connectOptions = {
        host: this.hostName,
        port: 22,
        username: this.user,
        password: this.password
      };
      ssh2client.on("ready", function() {
        ssh2client.exec(command, function(err, stream) {
          if (err) throw err;
          stream
            .on("close", function() {
              ssh2client.end();
              resolve();
            })
            .on("data", function(data) {
              console.log(data.toString("utf-8"));
            })
            .stderr.on("data", function(err) {
              reject(
                "Error executing command [" +
                  command +
                  "] with error [" +
                  err +
                  "]"
              );
            });
        });
      });
      ssh2client.connect(connectOptions);
    });
  }

  executeLocal(command) {
    return new Promise((resolve, reject) => {
      exec(command, function(err, stdout, stderr) {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        if (!err) resolve();
        else reject(err);
      });
    });
  }

  deployProject() {
    const task = "deploy";
    console.log("\nStarting " + task);

    return this.executeRemote("mkdir -p " + this.root)
      .then(() => {
        return this.executeLocal(
          "scp " +
            this.files.join(" ") +
            " " +
            this.user +
            "@" +
            this.hostName +
            ":" +
            this.root
        );
      })
      .then(() => {
        console.log("Done!");
        resolve();
      })
      .catch(err => {
        console.log("Error in " + task + ": " + err);
      });
  }

  restoreModules() {
    const task = "restore modules";
    console.log("\nStarting " + task);

    return this.executeRemote("cd " + this.root + ";sudo npm install")
      .then(() => {
        console.log("Done!");
      })
      .catch(err => {
        console.log("Error in " + task + ": " + err);
      });
  }

  fullDeploy() {
    this.deployProject()
      .then(() => {
        return restoreModules();
      })
      .then(() => {
        return this.stop();
      })
      .then(() => {
        return this.start();
      });
  }

  start() {
    const task = "starting app";
    console.log("\nStarting " + task);

    return this.executeRemote(
      "pm2 start " + this.root + "/" + this.startFile + " --watch"
    )
      .then(() => {
        console.log("Done!");
      })
      .catch(err => {
        console.log("Error in " + task + ": " + err);
      });
  }

  setupEnvironment() {
    const task = "installing nodejs 12.x and PM2";
    console.log("\nStarting " + task);
    return this.executeRemote(
      "curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -;sudo apt install -y nodejs;sudo npm install pm2 -g"
    )
      .then(() => {
        console.log("Done!");
      })
      .catch(err => {
        console.log("Error in " + task + ": " + err);
      });
  }

  stop() {
    const task = "stopping app";
    console.log("\nStarting " + task);

    return this.executeRemote("pm2 stop all")
      .then(function() {
        console.log("Done!");
      })
      .catch(function(err) {
        console.log("Error in " + task + ": " + err);
      });
  }
}
module.exports = Deployment;
