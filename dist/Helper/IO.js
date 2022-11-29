"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playLength = exports.playVideo = void 0;
const opencv4nodejs_1 = __importDefault(require("@u4/opencv4nodejs"));
const __1 = require("..");
let intervalID;
let playLength;
exports.playLength = playLength;
let extPlayLength = playLength;
const playVideo = (command) => {
    let playLength = command;
    const FPS = 16;
    const Vcap = new opencv4nodejs_1.default.VideoCapture(0);
    Vcap.set(opencv4nodejs_1.default.CAP_PROP_FRAME_WIDTH, 640);
    Vcap.set(opencv4nodejs_1.default.CAP_PROP_FRAME_HEIGHT, 480);
    if (playLength === "kill") {
        clearInterval(intervalID);
        __1.io.emit("image", "");
        __1.io.emit("serverStatus", "closing video server");
    }
    else {
        clearInterval(intervalID);
        intervalID = setInterval(() => {
            const frame = Vcap.read();
            try {
                const image = opencv4nodejs_1.default.imencode(".jpg", frame).toString("base64");
                __1.io.emit("image", image);
            }
            catch (_a) {
                (err) => console.log(err);
                console.log("crash");
                playVideo(playLength);
            }
        }, 1000 / FPS);
    }
    if (playLength !== 0 && playLength !== "kill") {
        setTimeout(() => {
            clearInterval(intervalID);
            __1.io.emit("image", "");
            __1.io.emit("serverStatus", "closing video server");
            __1.io.on("disconnect", (reason) => {
                console.log(reason);
            });
        }, playLength * 1000);
    }
};
exports.playVideo = playVideo;
