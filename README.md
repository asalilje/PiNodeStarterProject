# PiNodeStarterProject

A project for running node on Raspberry Pi via SSH. Should, but not tested, work on windows, osx and linux.

## Preprare your PI

Enabled SHH
Write down IP
Setup password

## Commands

npm run

### upload

Uploades files to the Pi. Files are listed in the deployer.

### fullDeploy

Runs the commands. Upload, Modules and Start in that order.

### start

Starts a background processes using PM2 that will make sure the app is alive. To se logs run

```bash
$ npm run logs
```

### logs

Shows PM2 logs.

### run

Runs the apps once without restarting. Good for testing code. Not good for continually running application.

### modules

Runs npm install on the Pi. Make sure to upload files before running.

### stop

Stop all running pm2 applications running.

### setup

Sets up your Pi with nodejs, npm and PM2. Good to run first time setting up.

## Good to know

### Widnows Build Tools Needed for SSH2

Start PowerShell or Cmd as admin and run

```bash
$ npm install -g --production windows-build-tools
```
