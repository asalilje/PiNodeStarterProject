"use strict";
const GPIO = require('onoff').Gpio;

function exit() {
    process.exit();
}

process.on('SIGINT', exit);





