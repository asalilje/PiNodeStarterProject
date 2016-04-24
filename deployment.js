"use strict";

var Q = require('q');
var ssh2Client = require('ssh2').Client;
var exec = require('child_process').exec;

class Deployment {
    constructor(config) {
        this.projectName = config.projectName;
        this.root = '/home/' + config.user + "/" + config.projectName;
        this.user = config.user;
        this.password = config.password;
        this.hostName = config.hostName;
        this.files = config.files;
        this.startFile = config.startFile;
        this.initialized = Q.defer();
        this.initialized.resolve();
    }

    executeRemote(command) {
        const deferred = Q.defer();
        const ssh2client = new ssh2Client();
        const connectOptions = {host: this.hostName, port: 22, username: this.user, password: this.password};
        ssh2client.on('ready', function () {
            ssh2client.exec(command, function (err, stream) {
                if (err)
                    throw err;
                stream
                    .on('close', function () {
                        ssh2client.end();
                        deferred.resolve();
                    })
                    .on('data', function (data) {
                        console.log(data);
                    })
                    .stderr.on('data', function (err) {
                    deferred.reject('Error executing command [' + command + '] with error [' + err + ']');
                });
            })
        });
        ssh2client.connect(connectOptions);
        return deferred.promise;
    };

    executeLocal(command) {
        const deferred = Q.defer();
        exec(command, function (err, stdout, stderr) {
            if (stdout)
                console.log(stdout);
            if (stderr)
                console.log(stderr);
            if (!err)
                deferred.resolve();
            else
                deferred.reject(err);
        });
        return deferred.promise;
    }


    deployProject() {
        const task = 'deploy';
        console.log('\nStarting ' + task);

        return Q.promise(function () {
            return this.initialized.promise
                .then(function () {
                    return this.executeRemote('mkdir -p ' + this.root);
                }.bind(this))
                .then(function () {
                    return this.executeLocal('scp ' + this.files.join(' ') + ' ' + this.user + '@' + this.hostName + ':' + this.root)
                }.bind(this))
                .then(function() {
                    console.log("Done!");
                })
                .catch(function (err) {
                    console.log('Error in ' + task + ': ' + err);
                });
        }.bind(this));
    }

    restoreModules() {
        const task = 'restore modules';
        console.log('\nStarting ' + task);

        return Q.promise(function () {
            return this.initialized.promise
                .then(function () {
                    return this.executeRemote('cd ' + this.root + ';sudo npm install');
                }.bind(this))
                .then(function() {
                    console.log("Done!");
                })
                .catch(function (err) {
                    console.log('Error in ' + task + ': ' + err);
                });
        }.bind(this));
    }

    run() {
        const task = 'starting app';
        console.log('\nStarting ' + task);

        return Q.promise(function () {
            return this.initialized.promise
                .then(function () {
                    return this.executeRemote('/usr/local/bin/node ' + this.root + '/' + this.startFile);
                }.bind(this))
                .then(function() {
                    console.log("Done!");
                })
                .catch(function (err) {
                    console.log('Error in ' + task + ': ' + err);
                });
        }.bind(this));
    }

    stop() {
        const task = 'stopping app';
        console.log('\nStarting ' + task);

        return Q.promise(function () {
            return this.initialized.promise
                .then(function () {
                    return this.executeRemote('killall node');
                }.bind(this))
                .then(function() {
                    console.log("Done!");
                })
                .catch(function (err) {
                    console.log('Error in ' + task + ': ' + err);
                });
        }.bind(this));
    }

}
module.exports = Deployment;
