import cv2 from "@u4/opencv4nodejs";
import { io } from "..";

let intervalID: any;
let playLength: any;
let extPlayLength = playLength;

const playVideo = (command: any) => {
  let playLength = command;
  const FPS = 16;
  const Vcap = new cv2.VideoCapture(0);
  Vcap.set(cv2.CAP_PROP_FRAME_WIDTH, 640);
  Vcap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480);

  if (playLength === "kill") {
    clearInterval(intervalID);
    io.emit("image", "");
    io.emit("serverStatus", "closing video server");
  } else {
    clearInterval(intervalID);
    intervalID = setInterval(() => {
      const frame = Vcap.read();

      try {
        const image = cv2.imencode(".jpg", frame).toString("base64");
        io.emit("image", image);
      } catch {
        (err) => console.log(err);
        console.log("crash");
        playVideo(playLength);
      }
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

export { playVideo, playLength };
