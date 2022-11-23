import {
  changeColor,
  sendTouchEvent,
  startEvent,
  directControl,
  directBrightnessControl,
  resetServer,
} from "../ADB/SendHandler";

export const preAlpha = ({ SetMap }) => {
  console.log("checkbust");
  console.log(SetMap.extended);
  if (SetMap.extended === "red") changeColor(1130, 1214);
  if (SetMap.extended === "blue") changeColor(728, 1622);
  if (SetMap.extended === "green") changeColor(324, 1214);
  if (SetMap.extended === "startLoaded") startEvent();
  if (SetMap.extended === "enableDirectControl") directControl("enable");
  if (SetMap.extended === "disableDirectControl") directControl("disable");
  if (SetMap.extended === "brightness")
    directBrightnessControl(SetMap.brightness);
};
