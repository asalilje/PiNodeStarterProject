"use strict";

const ssh2Client = require("ssh2").Client;
const exec = require("child_process").exec;
const sftpClient = require("ssh2-sftp-client");

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

  uploadFile() {
    const sftp = new sftpClient();
    sftp
      .connect({
        host: this.hostName,
        port: 22,
        username: this.user,
        password: this.password
      })
      .then(() => {
        const uploads = this.files.map(file => {
          return sftp.put(file, this.root + "/" + file);
        });

        return Promise.all(uploads);
      })
      .then(data => {
        console.log(data);
        sftp.end();
      })
      .catch(err => {
        console.log(err, "catch error");
        sftp.end();
      });
  }

  restoreModules() {
    const task = "restore modules";
    console.log("\nStarting " + task);

    return this.executeRemote(
      "cd " + this.root + ";sudo npm install --production --unsafe-perm=true"
    )
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
        return this.restoreModules();
      })
      .then(() => {
        return this.stop();
      })
      .then(() => {
        return this.start();
      });
  }

  run() {
    const task = "starting app";
    console.log("\nStarting " + task);

    return this.executeRemote(
      "pm2 start " +
        this.root +
        "/" +
        this.startFile +
        " --no-autorestart; pm2 logs"
    )
      .then(() => {
        console.log("Done!");
      })
      .catch(err => {
        console.log("Error in " + task + ": " + err);
      });
  }

  start() {
    const task = "starting app";
    console.log("\nStarting " + task);

    return this.executeRemote(
      "pm2 start " + this.root + "/" + this.startFile + " --watch;"
    )
      .then(() => {
        console.log("Done!");
      })
      .catch(err => {
        console.log("Error in " + task + ": " + err);
      });
  }

  logs() {
    const task = "starting app";
    console.log("\nStarting " + task);

    return this.executeRemote("pm2 logs")
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
      "sudo apt update -y;sudo apt install -y nodejs npm;sudo npm install pm2 -g"
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
