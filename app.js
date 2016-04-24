"use strict";
const GPIO = require('onoff').Gpio;

function exit() {
    led.writeSync(0);
    led.unexport();
    process.exit();
}

process.on('SIGINT', exit);





