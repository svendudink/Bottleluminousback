import express from "express";
import fs from "fs";
import { io } from "..";
import { playVideo } from "../Helper/IO";

const { exec } = require("child_process");

let currentPage = "frontPage";

let date = new Date();
let dateAndTime =
  date.getDate() +
  "/" +
  (date.getMonth() + 1) +
  "/" +
  date.getFullYear() +
  "   " +
  date.getHours() +
  ":" +
  date.getMinutes() +
  ":" +
  date.getSeconds();

const updatedDateAndTime = () => {
  let date = new Date();
  let dateAndTime =
    date.getDate() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    date.getFullYear() +
    "   " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds();

  return dateAndTime;
};

/////////////////////////////////////Sven's//Coding/ Date: 21-10-2022 11:26 ////////////
//List of bulbs with their Bulb designated ID
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
// const l = {
//   l1: "1-M1695",
//   l2: "2-M5546",
//   l3: "3-M7507",
//   l6: "6-M1492",
//   l11: "11-M3219",
//   l12: "12-M1209",
//   l13: "13-M1741",
//   l14: "14-M4279",
//   l15: "15-M6105",
//   l20: "20-M1262",
//   l21: "21-M0863",
//   l24: "24-M7967",
//   l25: "25-M4056",
//   l27: "27-M6838",
//   l28: "28-M2889",
//   l29: "29-M5145",
//   l30: "30-M2705",
//   l31: "31-M5610",
//   l33: "33-M3944",
//   l35: "35-M5192",
//   l36: "36-M2308",
//   l37: "37-M5405",
//   l39: "39-M2264",
//   l41: "41-M7420",
//   l43: "43-M8030",
//   l46: "46-M9085",
//   l47: "47-M0568",
//   l56: "56-M1074",
//   l57: "57-M2180",
//   l61: "61-M2250",
//   l62: "62-M4621",
//   l64: "64-M3110",
//   l66: "66-M3326",
//   l67: "67-M0752",
//   l71: "71-M9264",
//   l72: "72-M9598",
//   l73: "73-M7645",
//   l74: "74-M9102",
//   l75: "75-M9005",
//   l77: "77-M7237",
//   l78: "78-M6671",
//   l80: "80-M1759",
//   l82: "82-M3031",
//   l83: "83-M6983",
//   l84: "84-M9046",
//   l87: "87-M1029",
//   l88: "88-M7108",
//   l89: "89-M4795",
//   l90: "90-M0092",
//   l91: "91-M7699",
//   l92: "92-M6735",
//   l94: "94-M3497",
//   l96: "96-M7714",
//   l97: "97-M6257",
//   l98: "98-M7723",
//   l101: "101-M3865",
//   l102: "102-M7510",
//   l103: "103-M5654",
//   l104: "104-M9177",
//   l106: "106-M5718",
//   l107: "107-M1589",
//   l108: "108-M0265",
//   l115: "115-M9921",
// };

const l = {
  l6: "6-M1492",
  l12: "12-M1209",
  l25: "25-M4056",
  l33: "33-M3944",
  l35: "35-M5192",
  l37: "37-M5405",
  l41: "41-M7420",
  l74: "74-M9102",
  l96: "96-M7714",
  l97: "97-M6257",
  l98: "98-M7723",
  l106: "106-M5718",
};
export function createFile(
  bulbMovement: String,
  colourOptionValue: String,
  customLampArray: Array<String>
) {
  console.log(bulbMovement, colourOptionValue, customLampArray);

  //Random colours, if set to 0 fully random, if set to 1, set array of colours,
  let colourOption = Number(colourOptionValue);
  let randomColourArray = [-8799767, -8693575, -3672012];

  // bulb running direction, if set to 0 bulb will go linear, if set to 1, bulb will go fully random
  let bulbDirectionConfig = Number(bulbMovement);

  // end of set parameters

  let bulbNo = 0;
  let bulbDirection = 0;

  // lampsArray, use for setting array of lamps
  // string lenghts of 3 or less identify as groups

  let lampArray = [
    "1",
    l.l35,
    l.l15,
    l.l101,
    l.l96,
    l.l41,
    l.l33,
    l.l6,
    l.l1,
    l.l37,
    l.l11,
    l.l13,
    l.l39,
    l.l64,
    l.l47,
    l.l90,
    l.l89,
    l.l24,
    l.l62,
    l.l27,
    l.l78,
    l.l73,
    l.l29,
    l.l21,
    l.l66,
    l.l67,
    l.l75,
    l.l107,
    l.l25,
    l.l71,
    l.l97,
    l.l28,
    l.l61,
    l.l74,
    l.l21,
    l.l98,
    l.l104,
    l.l115,
    l.l103,
    l.l80,
    l.l88,
    l.l20,
    l.l12,
    l.l57,
    l.l108,
    l.l14,
    l.l72,
    l.l43,
    l.l2,
    l.l77,
    l.l83,
    l.l56,
    "1",
  ];

  let tempArray = [];
  customLampArray.forEach((e) => {
    tempArray.push(e.bulbId);
  });

  if (customLampArray.length >= 1) {
    lampArray = ["1", ...tempArray, "1"];
  }

  const singleLightBuilder = (
    onOff: boolean,
    bulb: String,
    brightness: number,
    color: string,
    saturation: number
  ) => {
    // console.log("checkout", brightness, Number(brightness) === 0);
    // console.log(Number(brightness));
    return `{&quot;cct&quot;:0,&quot;color&quot;:${color},&quot;deviceName&quot;:&quot;${bulb}&quot;,&quot;deviceType&quot;:&quot;DEVICE_TYPE_HSL&quot;,&quot;isGroup&quot;:${
      bulb.length <= 4 ? true : false
    },&quot;isOff&quot;:${
      Number(brightness) === 0 ? true : false
    },&quot;lightness&quot;:${brightness},&quot;saturation&quot;:${saturation}}`;
  };

  const LightArrayBuilder = (fullrepeats: number) => {
    let fullString = "";
    for (let i = 0; i < fullrepeats; i++) {
      let tempString = singleLightBuilder(
        true,
        lampArray[getWalkingBulb()],
        brightness(),
        getRandomColor(),
        100
      );

      fullString = fullString + tempString + ",";
    }
    fileCreator(fullString.substr(0, fullString.length - 1));

    return fullString.substr(0, fullString.length - 1);
  };

  function getRandomColor() {
    let colorString = "";
    if (colourOption === 0) {
    }
    if (colourOption === 1 && randomColourArray.length !== 0) {
      const min = Math.ceil(0);
      const max = Math.floor(randomColourArray.length);
      let cnumber = Math.floor(Math.random() * (max - min) + min);
      colorString = randomColourArray[cnumber].toString();
    } else {
      const min = Math.ceil(1000);
      const max = Math.floor(9000000);
      let cnumber = Math.floor(Math.random() * (max - min) + min);
      colorString = "-" + cnumber.toString();
    }

    return colorString;
  }

  function getRandomLamp() {
    const min = Math.ceil(0);
    const max = Math.floor(lampArray.length - 1);
    let cnumber = Math.floor(Math.random() * (max - min) + min);

    return cnumber;
  }

  getRandomColor();

  function getWalkingBulb() {
    if (bulbDirectionConfig === 0) {
      return 0;
    }

    if (bulbDirectionConfig === 1) {
      const min = Math.ceil(0);
      const max = Math.floor(lampArray.length - 1);
      let cnumber = Math.floor(Math.random() * (max - min) + min);

      return cnumber;
    }
    if (bulbDirection === 0) {
      bulbNo = bulbNo + 1;
      //console.log(bulbNo);
    } else {
      bulbNo = bulbNo - 1;
    }
    if (bulbNo === lampArray.length - 1) {
      bulbDirection = 1;
    }
    if (bulbDirection === 1 && bulbNo === 0) {
      bulbDirection = 0;
    }

    return bulbNo;
  }

  // use to set dimmed regions, or all dimmed, make an if statement with min and max bulb to set their dimmed values, last return is all bulbs
  let brightness = () => {
    if (bulbNo <= customLampArray.length - 1) {
      console.log(bulbNo);
      console.log("check", customLampArray[bulbNo].brightness);
      return customLampArray[bulbNo].brightness;
    } else return 100;
  };

  function fileCreator(lampConfig: String) {
    fs.writeFile(
      "com.ledvance.smartplus.eu_preferences.xml",
      `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <long name="server_time" value="1656448485099" />
    <string name="user_id">c83be1eb-8f59-4bf4-a77b-d6cd05a0b52b</string>
    <long name="elapse_real_time" value="290263" />
    <string name="RoutineList_Network_3109238874f8d064">[{&quot;color&quot;:-6334108,&quot;routineName&quot;:&quot;firstroutine&quot;,&quot;routineTaskList&quot;:[${lampConfig}],&quot;uuid&quot;:&quot;ed46e9cf-7ebf-42dd-b28f-fcad34a515d7&quot;}]</string>
    <string name="mesh_configuration_file">{&quot;isForceUpdateNewApp&quot;:false,&quot;isNotifyNewApp&quot;:false,&quot;maxBrightness&quot;:50,&quot;minBrightness&quot;:0,&quot;newAppMessageContent&quot;:{&quot;en&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;,&quot;de&quot;:&quot;Wir haben die Wartung der SMART+ Home App eingestellt, wir empfehlen Ihnen, unsere App der neuen Generation zu verwenden - SMART+ Unified Home App. Das SMART+ Unified Home bietet ein besseres Erlebnis und funktioniert mit Bluetooth-Produkten und WiFi-Produkten.&quot;,&quot;es&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;,&quot;fr&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;,&quot;it&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;,&quot;ja&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;,&quot;ko&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;,&quot;tr&quot;:&quot;We have stopped maintain SMART+ Home App, we recommend you use our new generation app - SMART+ Unified Home App. The SMART+ Unified Home has a better experience, and work with Bluetooth products and WiFi Products.&quot;},&quot;newAppMessageTitle&quot;:{&quot;en&quot;:&quot;Upgrade to Smart+ Unified Home&quot;,&quot;de&quot;:&quot;Migrieren Sie zu LEDVANCE Unified&quot;,&quot;es&quot;:&quot;Migrate to LEDVANCE Unified&quot;,&quot;fr&quot;:&quot;Migrate to LEDVANCE Unified&quot;,&quot;it&quot;:&quot;Migrate to LEDVANCE Unified&quot;,&quot;ja&quot;:&quot;Upgrade to Smart+ Unified Home&quot;,&quot;ko&quot;:&quot;Migrate to LEDVANCE Unified&quot;,&quot;tr&quot;:&quot;Migrate to LEDVANCE Unified&quot;},&quot;newAppPathAndroid&quot;:&quot;https://play.google.com/store/apps/details?id\u003dcom.ledvance.smartplus.eu&quot;,&quot;newAppPathIOS&quot;:&quot;https://play.google.com/store/apps/details?id\u003dcom.ledvance.smartplus.eu&quot;,&quot;targetAppUpgradeType&quot;:0,&quot;targetVersionAndroid&quot;:20109}</string>
    <int name="network_version" value="0" />
</map>`,
      function (err) {
        if (err) throw err;
        console.log("Saved!");
        io.emit("serverStatus", `${dateAndTime}  file created`);
      }
    );
  }

  LightArrayBuilder(200);
}

/////////////////////////////////////Sven's//Coding/ Date: 20-11-2022 20:48 ////////////
// Check if device is busy with autoreset
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
let resetTime = 0;
let scriptState = "free";
let intervalID: any;

const setDeviceStatus = (input) => {
  if (input === "free") {
    resetTime = 0;
    clearInterval(intervalID);
    scriptState = "free";
  }
  if (scriptState === "busy") {
    return "busy";
  }

  if (input === "busy") {
    scriptState = "busy";
    resetTime = 300;
    clearInterval(intervalID);
    intervalID = setInterval(() => {
      console.log(resetTime, scriptState);
      resetTime = resetTime - 1;
      if (resetTime === 0) {
        clearInterval(intervalID);
        scriptState = "free";
      }
    }, 1000);
  }
};

/////////////////////////////////////Sven's//Coding/ Date: 21-10-2022 11:18 ////////////
// set adb in root mode and remount with read write access
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const root = () => {
  return new Promise((resolve, reject) => {
    exec(`./adb root`, { shell: "powershell.exe" }, (error, stdout, stderr) => {
      if (stdout.includes("restarting adbd in root mode")) {
        exec(
          `./adb remount`,
          { shell: "powershell.exe" },
          (error, stdout, stderr) => {
            resolve("root and remount with write access ");
          }
        );
      } else {
        exec(
          `./adb remount`,
          { shell: "powershell.exe" },
          (error, stdout, stderr) => {
            resolve("root and remount with write access ");
          }
        );
        resolve("allready rooted");
      }
    });
  });
};

let tries = 0;

const changeColor = async (x, y) => {
  let waiting: String;
  await turnOnDisplay();

  await sendTouchEvent(x, y, 0);
};

/////////////////////////////////////Sven's//Coding/ Date: 02-11-2022 17:28 ////////////
// starting an event
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const startEvent = async () => {
  const results = await checkAndWait(
    649,
    126,
    66,
    "connected",
    255,
    "disconneced",
    211,
    "trying",
    60
  );
  console.log(results);
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 10:54 ////////////
// putting delays in between linear running code
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const betterSetTimeOut = (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done");
    }, time);
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 09-11-2022 21:07 ////////////
// enabling and Disabling the direct control functions
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const directControl = async (event) => {
  if (event === "enable" && scriptState === "free") {
    if (currentPage === "colorWheel" && scriptState === "free") {
      setDeviceStatus("busy");

      io.emit("serverStatus", `${updatedDateAndTime()}  turning on display`);
      io.emit(
        "serverStatus",
        `${updatedDateAndTime()}  Direct control mode started`
      );
      await turnOnDisplay();
      playVideo(300);
      scriptState = "free";
    } else {
      setDeviceStatus("busy");
      scriptState = "busy";
      currentPage = "colorWheel";
      io.emit("serverStatus", `${updatedDateAndTime()}  turning on display`);
      await turnOnDisplay();
      io.emit(
        "serverStatus",
        `${updatedDateAndTime()}  setting ADB in root mode`
      );
      await root();
      io.emit("serverStatus", `${updatedDateAndTime()}  kill OSRAM App`);
      await killApp();
      io.emit("serverStatus", `${updatedDateAndTime()}  restarting app`);
      await restartApp();

      await checkAndWait(
        649,
        126,
        66,
        "connected",
        255,
        "trying to connect",
        211,
        "trying to connect",
        30
      );
      await sendTouchEvent(930, 850, 0);
      await checkAndWait(
        1080,
        1200,
        255,
        "colorwheel loaded",
        255,
        "trying to connect",
        255,
        "trying to connect",
        20
      );
      io.emit(
        "serverStatus",
        `${updatedDateAndTime()}  starting live video stream`
      );
      io.emit(
        "serverStatus",
        `${updatedDateAndTime()}  Direct control mode started`
      );
      setDeviceStatus("free");
      playVideo(300);
    }
  } else {
    playVideo("kill");
  }
  if (scriptState !== "free") {
    io.emit(
      "serverStatus",
      `${updatedDateAndTime()}  Device is busy running another script`
    );
  }
};

/////////////////////////////////////Sven's//Coding/ Date: 02-11-2022 18:47 ////////////
// check and wait for pixel change, if first color is reached, function ends,
// (X,Y,color 1, io message 1, color 2, io message 2, color 3,io message 3)

// watching for device to connect to android by checking the pixel changing to green
// when a connection is established
// and wghen 30 trials have been made perform a device reset, and do another round of 30
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const checkAndWait = async (
  x,
  y,
  color1,
  message1,
  color2,
  message2,
  color3,
  message3,
  timeOuts
) => {
  let maxTimeOuts = timeOuts;
  let rebootcycles = 0;
  if (!timeOuts) {
    maxTimeOuts = 5;
  }
  let result = "";

  const watchConnection = async () => {
    let pixelColor = await checkPixelColor(x, y);
    await betterSetTimeOut(2000);
    console.log(pixelColor);

    if (pixelColor[0] >= color1 - 2 && pixelColor[0] <= color1 + 2) {
      result = "finished";
      io.emit("serverStatus", `${updatedDateAndTime()} ${message1}`);
    } else if (pixelColor[0] >= color2 - 2 && pixelColor[0] <= color2 + 2) {
      result = "timeout";
      io.emit("serverStatus", `${updatedDateAndTime()}  ${message2}`);
    } else if (pixelColor[0] >= color3 - 2 && pixelColor[0] <= color3 + 2) {
      io.emit("serverStatus", `${updatedDateAndTime()}  ${message3}`);
      sendTouchEvent(644, 126, 0);
    }
  };
  for (let i = 0; i < maxTimeOuts; i++) {
    await watchConnection();

    if (result === "finished") {
      break;
    }
    if (
      message1 === "connected" &&
      i === maxTimeOuts - 1 &&
      rebootcycles === 0
    ) {
      rebootcycles = 1;
      i = 0;
      console.log("reboot");
      io.emit(
        "serverStatus",
        `${updatedDateAndTime()} device cant connect, device will reboot, please wait 1 minute`
      );
      reboot("");
      await betterSetTimeOut(5000);
      await checkIfConnected();
      io.emit(
        "serverStatus",
        `${updatedDateAndTime()}  device succesfully restarted`
      );
      await restartApp();
      io.emit("serverStatus", `${updatedDateAndTime()}  restarting app`);
      await root();
      io.emit("serverStatus", `${updatedDateAndTime()}  kill OSRAM App`);
      await watchConnection();
    }
  }
  rebootcycles = 0;
  return result;
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 07:36 ////////////
// turn on the display if display has been turneds off, to speed up the process no check is performed
// if display has been turned on 598 seconds prior to display being turned on
// display turn of is set to 600 seconds
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

let lastDisplayTurnedOnTime = 0;

const turnOnDisplay = () => {
  return new Promise((resolve, reject) => {
    if (Date.now() - lastDisplayTurnedOnTime < 598000) {
      console.log(Date.now() - lastDisplayTurnedOnTime);
      resolve("Display still on based on timestamp");
    }
    exec(
      `./adb shell "dumpsys display | grep "mScreenState""`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        if (error) reject(error);
        if (
          stdout.includes("mScreenState=OFF") ||
          stdout.includes("mScreenState=DOZE")
        ) {
          exec(
            `./adb shell input keyevent KEYCODE_POWER`,
            { shell: "powershell.exe" },
            (error: String, stdout: String) => {
              console.log(stderr);
              if (error) {
                reject(error);
              }
              lastDisplayTurnedOnTime = Date.now();
              resolve(stdout);
            }
          );
        } else resolve("Display allready on");
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 09-11-2022 23:17 ////////////
// Brightness
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
const directBrightnessControl = (event) => {
  let x = Math.round(181 + (1036 / 100) * event);
  if (event === "0") {
    console.log("done");
    turnOnDisplay();
    sendTouchEvent(1070, 2750, 0);
  } else {
    turnOnDisplay();
    sendTouchEvent(x, 2578, 0);
  }

  console.log("event", event);
};

/////////////////////////////////////Sven's//Coding/ Date: 19-10-2022 17:46 ////////////
// makes a screendump and checks color of selected pixel by looking into the hexdump
// on location of the pixel
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const checkPixelColor = (x, y) => {
  const pixelLocation = 1440 * y + x;

  return new Promise((resolve, reject) => {
    exec(
      `./adb shell screencap screen.dump`,
      { shell: "powershell.exe" },
      (error: String, stdout: String) => {
        if (error) {
          console.log(error);
        }

        exec(
          `./adb shell "dd if='./screen.dump' bs=4 count=1 skip=${pixelLocation} 2>/dev/null |  /sbin/.magisk/busybox/hd"`,
          { shell: "powershell.exe" },
          (error: String, stdout: String) => {
            console.log("view", error, stdout);
            let colorR = 0;
            let colorG = 0;
            let colorB = 0;

            let final = "";
            let pattern = "0000000000 ";

            final = stdout
              .substring(
                stdout.indexOf(pattern) + pattern.length,
                stdout.length
              )
              .slice(0, 11);
            colorR = parseInt(final.slice(0, 2), 16);
            colorG = parseInt(final.slice(3, 5), 16);
            colorB = parseInt(final.slice(6, 8), 16);
            console.log(colorR, colorG, colorB);
            resolve([colorR, colorG, colorB]);
          }
        );
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 07:39 ////////////
// send simple touch event tpo device
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const sendTouchEvent = async (x, y, timeOut) => {
  return new Promise((resolve, reject) => {
    exec(
      `./adb shell input tap ${x} ${y}`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        setTimeout(() => {
          resolve(stdout);
        }, timeOut);
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 20-10-2022 13:08 ////////////
// check if device is available for writing
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
const checkIfConnected = async () => {
  let result = "notconnected";

  const tryPullFile = async () => {
    exec(
      `./adb pull "/XxX"`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        console.log(stdout);
        if (
          stdout.includes("no devices/emulators") ||
          stdout.includes("device unauthorized")
        ) {
          result = "notconnected";
          console.log("notconnected");
        } else {
          console.log("connected");
          result = "connected";
        }
      }
    );
  };

  for (let i = 0; i < 35; i++) {
    await tryPullFile();
    await betterSetTimeOut(1000);

    if (result === "connected") {
      await betterSetTimeOut(10000);
      break;
    }
  }
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 07:40 ////////////
// kill app, load new file, restart app, start video server, and start loaded lights file
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

export const RebootToDownload = async () => {
  if (scriptState === "free") {
    setDeviceStatus("busy");
    currentPage = "mappedEvent";
    io.emit("turning on display");
    await turnOnDisplay();
    io.emit(
      "serverStatus",
      `${updatedDateAndTime()}  setting ADB in root mode`
    );
    await root();
    io.emit("serverStatus", `${updatedDateAndTime()}  kill OSRAM App`);
    await killApp();
    io.emit("serverStatus", `${updatedDateAndTime()}  delete light file`);
    await deleteFileFromAndroid();
    io.emit("serverStatus", `${updatedDateAndTime()}  write new file`);
    await writeFileToAndroid();
    io.emit("serverStatus", `${updatedDateAndTime()}  restarting app`);
    await restartApp();

    io.emit(
      "serverStatus",
      `${updatedDateAndTime()}  awaiting connection with lights`
    );

    await checkAndWait(
      649,
      126,
      66,
      "connected",
      255,
      "trying to connect",
      211,
      "trying to connect",
      60
    );
    io.emit(
      "serverStatus",
      `${updatedDateAndTime()}  starting live video stream`
    );
    playVideo(240);
    io.emit("serverStatus", `${updatedDateAndTime()}  loading light file`);

    await checkAndWait(300, 300, 158, "file loaded");
    await sendTouchEvent(300, 300, 0);
    io.emit("serverStatus", `${updatedDateAndTime()}  light event started`);
    setDeviceStatus("free");
  } else {
    io.emit("serverStatus", `${updatedDateAndTime()}  a script is running`);
  }
  console.log("test");
  // reboot("");
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 07:41 ////////////
// write the lightsfile to android system
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const writeFileToAndroid = () => {
  return new Promise((resolve, reject) => {
    exec(
      `./adb push C:/Users/server/Downloads/lightscript/lightscript/com.ledvance.smartplus.eu_preferences.xml "/data/data/com.ledvance.smartplus.eu/shared_prefs/"`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        console.log("push", error, stdout, stderr);
        resolve(stdout);
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 07:42 ////////////
// delete the lights file from system
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const deleteFileFromAndroid = () => {
  return new Promise((resolve, reject) => {
    exec(
      `./adb shell rm -f -rR -v /data/data/com.ledvance.smartplus.eu/shared_prefs/com.ledvance.smartplus.eu_preferences.xml`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        resolve(stdout);
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 23-11-2022 07:42 ////////////
// reboot the device
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const reboot = (mode: String) => {
  exec(
    `./adb reboot ${mode}`,
    { shell: "powershell.exe" },
    (error, stdout, stderr) => {
      console.log("recovery", error, stdout, stderr);
    }
  );
};

/////////////////////////////////////Sven's//Coding/ Date: 20-10-2022 14:29 ////////////
// Kill app for file adding
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
const killApp = () => {
  return new Promise((resolve, reject) => {
    exec(
      `./adb shell "am force-stop com.ledvance.smartplus.eu"`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        resolve(stdout);
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 20-10-2022 14:31 ////////////
// Restart app
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
const restartApp = () => {
  return new Promise((resolve, reject) => {
    exec(
      `./adb shell "monkey -p com.ledvance.smartplus.eu -c android.intent.category.LAUNCHER 1"`,
      { shell: "powershell.exe" },
      (error, stdout, stderr) => {
        resolve(stdout);
      }
    );
  });
};

/////////////////////////////////////Sven's//Coding/ Date: 20-11-2022 19:40 ////////////
// reset server
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const resetServer = async () => {
  setTimeout(function () {
    // Listen for the 'exit' event.
    // This is emitted when our app exits.
    process.on("exit", function () {
      //  Resolve the `child_process` module, and `spawn`
      //  a new process.
      //  The `child_process` module lets us
      //  access OS functionalities by running any bash command.`.
      require("child_process").spawn(process.argv.shift(), process.argv, {
        cwd: process.cwd(),
        detached: true,
        stdio: "inherit",
      });
    });
    process.exit();
  }, 1000);
};

/////////////////////////////////////Sven's//Coding/ Date: 03-11-2022 15:58 ////////////
// some colors
// 55 = main page of android
// 57 = main page of android
// some day night correction going on?
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

export {
  l,
  changeColor,
  startEvent,
  directControl,
  directBrightnessControl,
  resetServer,
};
