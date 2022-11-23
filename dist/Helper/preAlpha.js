"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preAlpha = void 0;
const SendHandler_1 = require("../ADB/SendHandler");
const preAlpha = ({ SetMap }) => {
    console.log("checkbust");
    console.log(SetMap.extended);
    if (SetMap.extended === "red")
        (0, SendHandler_1.changeColor)(1130, 1214);
    if (SetMap.extended === "blue")
        (0, SendHandler_1.changeColor)(728, 1622);
    if (SetMap.extended === "green")
        (0, SendHandler_1.changeColor)(324, 1214);
    if (SetMap.extended === "startLoaded")
        (0, SendHandler_1.startEvent)();
    if (SetMap.extended === "enableDirectControl")
        (0, SendHandler_1.directControl)("enable");
    if (SetMap.extended === "disableDirectControl")
        (0, SendHandler_1.directControl)("disable");
    if (SetMap.extended === "brightness")
        (0, SendHandler_1.directBrightnessControl)(SetMap.brightness);
};
exports.preAlpha = preAlpha;
