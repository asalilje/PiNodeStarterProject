"use strict";

const gulp = require('gulp');
const Deployment = require("./deployment.js");

const Deploy = new Deployment({
    hostName: '192.168.1.97',
    projectName: 'PiNodeStarterProject',
    user: 'pi',
    password: 'raspberry',
    files: ['app.js','package.json'],
    startFile: 'app.js '
});

gulp.task('deploy', function () {
    return Deploy.deployProject();
});

gulp.task('run', function () {
    return Deploy.run();
});

gulp.task('modules', function () {
    return Deploy.restoreModules();
});

gulp.task('stop', function () {
    return Deploy.stop();
});
