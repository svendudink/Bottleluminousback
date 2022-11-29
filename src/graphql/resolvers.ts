import { RebootToDownload, readFileFromAndroid } from "../ADB/SendHandler";
import { createFile } from "../ADB/SendHandler";
import { l } from "../ADB/SendHandler";
import fs from "fs";
import { db, transporter } from "..";
import { textConvert } from "../Helper/textConvert";
import { lampActions } from "../Helper/mapEffects";
import { dbTwo, dbThree } from "../index";
import { preAlpha } from "../Helper/preAlpha";
import User from "../models/User";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
const PDFDocument = require("pdfkit");
const axios = require('axios');
import { io } from "..";
let search = ""
const { extractColors } = require('extract-colors')
const icoToPng = require('ico-to-png')
const https = require('https');
const puppeteer = require("puppeteer");
var getImageUrls = require('get-image-urls');
const request = require('request');
const cp = require('child_process');



let returnTable: any = [];


//conbee params  http://192.168.2.105:80/api/0C20FFC055/lights
// {"devicetype": "myApp"}
// {
//         "success": {
//             "username": "0C20FFC055"
//         }
//     }
// ]

const MapLamps = function ({ SetMap }: any) {
  return new Promise((resolve, reject) => {
    SetMap.mapName = textConvert(SetMap.mapName);
    if (
      SetMap.request === "verticalScan" ||
      SetMap.request === "horizontalScan" ||
      SetMap.request === "deleteActive" ||
      SetMap.request === "addLampBeforeActive" ||
      SetMap.request === "Hottest" ||
      SetMap.request === "brightness" ||
      SetMap.request === "resetServer" ||
      SetMap.request === "close" ||
      SetMap.request === "addColor"
    ) {
      resolve(lampActions({ SetMap }));
    } else if (SetMap.request === "directEvent") {
      resolve(preAlpha({ SetMap }));
    } else if (SetMap.request === "newMap") {
      const result = dbThree
        .prepare(
          `CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text, colors text)`
        )
        .run();
      resolve({
        eventList: JSON.stringify(result),
      });
    } else if (SetMap.request === "load") {

    
  
      const result = dbThree
        .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
        .all();
      resolve({
        bulbIdList: JSON.stringify(availableBulbIdListFilter(l, result)),
        maxBuldIdLength: (Object.keys(l).length).toString(),
        mapArray: JSON.stringify(result),
        availableBulbIdList: ""
      });
    } else if (SetMap.request === "update") {
      const result = dbThree
        .prepare(`UPDATE ${SetMap.mapName} SET lat = ?, lng = ? WHERE id = ?`)
        .run(`${SetMap.lat}`, `${SetMap.lng}`, `${SetMap.bulbNumber}`);

      resolve({ mapArray: null });
    } else if (SetMap.request === "updateBulbId") {
      const result = dbThree
        .prepare(`UPDATE ${SetMap.mapName} SET bulbId = ? WHERE id = ?`)
        .run(`${SetMap.bulbId}`, `${SetMap.bulbNumber}`);

      resolve({ mapArray: null });
    } else if (SetMap.request === "addLamp") {
      const result = dbThree
        .prepare(
          `INSERT INTO ${SetMap.mapName} (id ,lat, lng, key, brightness, colors) VALUES (?,?,?,?,?,?)`
        )
        .run(
          `${SetMap.bulbNumber}`,
          `${SetMap.lat}`,
          `${SetMap.lng}`,
          Math.random(),
          `${SetMap.brightness}`,
          "[]"
        );

      resolve({
        bulbIdList: JSON.stringify(l),
        eventList: JSON.stringify(result),
      });
    } else if (SetMap.request === "firstLoad") {
      const result = dbThree.prepare(`PRAGMA table_list`).all();
      resolve({
        bulbIdList: JSON.stringify(l),
        eventList: JSON.stringify(result),
      });
    } else if (SetMap.request === "delete") {
      const result = dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();

      resolve({
        eventList: JSON.stringify(result),
      });
    } else reject("no valid request");
  });
};

export const availableBulbIdListFilter = (fullList, mapArray) => {


  let adjustedList = JSON.parse(JSON.stringify(fullList));
  mapArray.forEach((element) => {
    if (element.bulbId) {
      delete adjustedList[element.bulbId];
      
    }
  });

  return adjustedList;
};

const ControlDevice = async function ({ SetValues }: any) {
  if (SetValues.sendToAndroid === "true") {
    RebootToDownload();
  }

  if (SetValues.readFileFromAndroid === "true") {
    readFileFromAndroid();
  }

  if (SetValues.createLightFile === "true") {
    const buildMapping = async (mapName) => {
      let bulbArray: Array<String> = [];

      let promise = new Promise((resolve, reject) => {
        // db.all(`SELECT * FROM ${mapName}`, (err, table) => {
        //   table.forEach((element) => {
        //     if (element.bulbId) {
        //       bulbArray.push(l[element.bulbId]);
        //     }
        //   });
        //   resolve(table);
        // });
        const result = dbThree.prepare(`SELECT * FROM ${mapName}`).all();
        result.forEach((element) => {
         
          if (element.bulbId) {
            bulbArray.push({
              bulbId: l[element.bulbId],
              brightness: element.brightness,
              colors: element.colors,
            });
          }
        });
        resolve(result);
      });
      let waitingBulbArray = await promise;

      createFile(SetValues.bulbMovement, SetValues.bulbColours, bulbArray);
      return bulbArray;
    };
    buildMapping(textConvert(SetValues.mapping));
  }
  return { notDefined: "bla" };
};

/////////////////////////////////////Sven's//Coding/ Date: 26-11-2022 14:08 ////////////
// Users
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////

const createUser = async function ({ userInput }) {
  const errors = [];
  if (!validator.isEmail(userInput.emailAdress)) {
    errors.push({
      message: "email Adress is invalid",
    });
  }
  if (
    validator.isEmpty(userInput.password) ||
    !validator.isLength(userInput.password, { min: 4 })
  ) {
    errors.push({ message: "Password to short" });
  }
  const existingUser = await User.findOne({
    emailAdress: userInput.emailAdress,
  });
  if (existingUser) {
    const errors = new Error("user exist already!");
    throw errors;
  }
  const hashedPw = await bcrypt.hash(userInput.password, 12);
  const user = new User({
    emailAdress: userInput.emailAdress,
    password: hashedPw,
    aboutCompany: userInput.aboutCompany,
    companyName: userInput.companyName,
    phoneNumber: userInput.phoneNumber,
    yourName: userInput.yourName,
  });
  if (errors.length > 0) {
    const error = new Error("invalid input");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const createdUser = await user.save();
  if (userInput.companyName) {
    sendEmail(userInput.emailAdress, userInput.yourName, userInput.companyName, userInput.aboutCompany);
   
}

   
  return { ...createdUser._doc, _id: createdUser.id.toString() };
};

const loginUser = async function ({ emailAdress, password }) {
  const user = await User.findOne({ emailAdress: emailAdress });
  console.log(user);
  if (!user) {
    const error = new Error("user not found");
    error.code = 401;
    throw error;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Password is incorrect.");
    error.code = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      emailAdress: user.emailAdress,
    },
    "process.env.SECRET_JWTyesiknowthisdoesnotworkbutatleastnowitsaveryhardkeytoguessifyoudontbelievemegiveitatrycloseyoureyesthinkofsomethingandifitisexactlythisstringiwillgiveyou2euro50andiwillbuyyouasnickers",
    { expiresIn: "365d" }
  );
  return { token: token, userId: user._id.toString() };
};



const betterSetTimeOut = (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done");
    }, time);
  });
};

const infoExtractor = async (companyName: any) => {

  let adress = ""
  let fileName: any
  let hex = "#ff6900"

    // ColorFIlter
   const colorFilter = (colors) => {
  const diffNr = 20;
  
  colors.sort((a, b) => {
    return b.area - a.area;
  });
  for (let i = 0; i < colors.length; i++) {
   let  total = colors[i].red + colors[i].green + colors[i].blue;
   let avg = total / 3;
    console.log("check", colors[i]);
    if (
      avg - colors[i].red > diffNr ||
      colors[i].red - avg > diffNr ||
      avg - colors[i].green > diffNr ||
      colors[i].green - avg > diffNr ||
      avg - colors[i].blue > diffNr ||
      colors[i].blue - avg > diffNr
    ) {
      hex = colors[i].hex;
      break;
    }
  }
  console.log(hex);
  };
  // end of colorFilter


  
  
 
const params = {
  api_key: "D52BE1C12A0745D1A14B9E6FC16C308B",
  search_type: "images",
  q: `${companyName} berlin logo`,
  location: "Berlin,germany"
  }
  
    const download = (url, fileName) => {
https
  .get(url, res => {
    // Open file in local filesystem
    const file = fs.createWriteStream(fileName)

    // Write data into local file
    res.pipe(file)

    // Close the file
    file.on('finish', () => {
      file.close()
      console.log(`File downloaded!`)
    })
  })
  .on('error', err => {
    console.log('Error: ', err.message)
  })
      }


await axios.get('https://api.scaleserp.com/search',  { params })
  .then(response => {

    // print the JSON response from Scale SERP
   
    io.emit("infoExtractTest", JSON.stringify(response.data, 0, 2));
    search = JSON.stringify(response.data, 0, 2)


    

     adress = response.data.image_results[0].image
    fileName = `brand${adress.slice(-5)}`
    console.log(adress);
  download(adress, fileName)

  }).catch(error => {
    // catch and print the error
    console.log(error);
  })
  
    
    
    

 
     
await betterSetTimeOut(10000)

  console.log("chicdk");
  await extractColors(fileName)
  .then((res) => (colorFilter(res)))
    .catch(console.error)    
  
  
 
      
      
    
  return { hex: hex, fileName: fileName}
  
  


  




    
}
    

const sendEmail = async (email, name, companyName, aboutCompany) => {
  const params = await infoExtractor(companyName)
  await docCreator(name, companyName, params.hex,params.fileName);
console.log(typeof email, email, "email");
  const mail = {
    from: process.env.SMTP_FROM_EMAIL,
    to: email,
    subject: "Welcome to Bottle Luminous",
    attachments:[{   
            path: "CVSvenDudink.pdf"
        }]
    text: `
      Welcome to Bottle Luminous`,
  };
  transporter.sendMail(mail, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("done");
    }
  });
};

const docCreator = async (name, companyName, hexColor, imageName) => {
  console.log("test");
  // Create a document
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  doc
  .save()
  .moveTo(0, 0)
  .lineTo(0 , 841.89)
  .lineTo(220,841.89).lineTo(220, 180).lineTo(595.28, 180).lineTo(595.28, 50).lineTo(220, 50).lineTo(220, 0).lineTo(0, 0)
  .fill(hexColor);
  // draw some text
  //595.28 x 841.89
  doc.font('Archivo.ttf')
  doc.fillColor('#0c2e4d')
  doc.fontSize(10.6);
  doc.image("CVnoBackground.png", 0, 0, { width: 595.28 })
  doc.text(`Generated for ${name} from ${companyName}`, 270, 10)
  doc.image(imageName,220, 5, {fit: [40, 40]})

  doc.end();
  await doc.pipe(fs.createWriteStream("CVSvenDudink.pdf"));

  return "finished";
};

const graphqlResolver = {
  ControlDevice: ControlDevice,
  MapLamps: MapLamps,
  login: loginUser,
  createUser: createUser,
};

export { graphqlResolver };
