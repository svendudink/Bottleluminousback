import cv2 from "@u4/opencv4nodejs";
import { io } from "..";

let intervalID: any;
let playLength: any;

const playVideo = (command: any) => {
  let playLength = command;
  const FPS = 7;
  const Vcap = new cv2.VideoCapture(0);
  Vcap.set(cv2.CAP_PROP_FRAME_WIDTH, 320);
  Vcap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240);

  if (playLength === "kill") {
    clearInterval(intervalID);
    io.emit("image", "");
    io.emit("serverStatus", "closing video server");
  } else {
    intervalID = setInterval(() => {
      const frame = Vcap.read();
      const image = cv2.imencode(".jpg", frame).toString("base64");
      io.emit("image", image);
    }, 1000 / FPS);
  }
  if (playLength !== 0 && playLength !== "kill") {
    setTimeout(() => {
      clearInterval(intervalID);
      io.emit("image", "");
      io.emit("serverStatus", "closing video server");
      io.on("disconnect", (reason) => {
        console.log(reason);
      });
    }, playLength * 1000);
  }
};

export { playVideo };
