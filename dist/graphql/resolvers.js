"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlResolver = exports.availableBulbIdListFilter = void 0;
const SendHandler_1 = require("../ADB/SendHandler");
const SendHandler_2 = require("../ADB/SendHandler");
const SendHandler_3 = require("../ADB/SendHandler");
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const textConvert_1 = require("../Helper/textConvert");
const mapEffects_1 = require("../Helper/mapEffects");
const index_1 = require("../index");
const preAlpha_1 = require("../Helper/preAlpha");
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const PDFDocument = require("pdfkit");
const axios = require('axios');
const __2 = require("..");
let search = "";
const { extractColors } = require('extract-colors');
const icoToPng = require('ico-to-png');
const https = require('https');
const puppeteer = require("puppeteer");
var getImageUrls = require('get-image-urls');
const request = require('request');
const cp = require('child_process');
let returnTable = [];
//conbee params  http://192.168.2.105:80/api/0C20FFC055/lights
// {"devicetype": "myApp"}
// {
//         "success": {
//             "username": "0C20FFC055"
//         }
//     }
// ]
const MapLamps = function ({ SetMap }) {
    return new Promise((resolve, reject) => {
        SetMap.mapName = (0, textConvert_1.textConvert)(SetMap.mapName);
        if (SetMap.request === "verticalScan" ||
            SetMap.request === "horizontalScan" ||
            SetMap.request === "deleteActive" ||
            SetMap.request === "addLampBeforeActive" ||
            SetMap.request === "Hottest" ||
            SetMap.request === "brightness" ||
            SetMap.request === "resetServer" ||
            SetMap.request === "close" ||
            SetMap.request === "addColor") {
            resolve((0, mapEffects_1.lampActions)({ SetMap }));
        }
        else if (SetMap.request === "directEvent") {
            resolve((0, preAlpha_1.preAlpha)({ SetMap }));
        }
        else if (SetMap.request === "newMap") {
            const result = index_1.dbThree
                .prepare(`CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text, colors text)`)
                .run();
            resolve({
                eventList: JSON.stringify(result),
            });
        }
        else if (SetMap.request === "load") {
            const result = index_1.dbThree
                .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                .all();
            resolve({
                bulbIdList: JSON.stringify((0, exports.availableBulbIdListFilter)(SendHandler_3.l, result)),
                maxBuldIdLength: (Object.keys(SendHandler_3.l).length).toString(),
                mapArray: JSON.stringify(result),
                availableBulbIdList: ""
            });
        }
        else if (SetMap.request === "update") {
            const result = index_1.dbThree
                .prepare(`UPDATE ${SetMap.mapName} SET lat = ?, lng = ? WHERE id = ?`)
                .run(`${SetMap.lat}`, `${SetMap.lng}`, `${SetMap.bulbNumber}`);
            resolve({ mapArray: null });
        }
        else if (SetMap.request === "updateBulbId") {
            const result = index_1.dbThree
                .prepare(`UPDATE ${SetMap.mapName} SET bulbId = ? WHERE id = ?`)
                .run(`${SetMap.bulbId}`, `${SetMap.bulbNumber}`);
            resolve({ mapArray: null });
        }
        else if (SetMap.request === "addLamp") {
            const result = index_1.dbThree
                .prepare(`INSERT INTO ${SetMap.mapName} (id ,lat, lng, key, brightness, colors) VALUES (?,?,?,?,?,?)`)
                .run(`${SetMap.bulbNumber}`, `${SetMap.lat}`, `${SetMap.lng}`, Math.random(), `${SetMap.brightness}`, "[]");
            resolve({
                bulbIdList: JSON.stringify(SendHandler_3.l),
                eventList: JSON.stringify(result),
            });
        }
        else if (SetMap.request === "firstLoad") {
            const result = index_1.dbThree.prepare(`PRAGMA table_list`).all();
            resolve({
                bulbIdList: JSON.stringify(SendHandler_3.l),
                eventList: JSON.stringify(result),
            });
        }
        else if (SetMap.request === "delete") {
            const result = index_1.dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
            resolve({
                eventList: JSON.stringify(result),
            });
        }
        else
            reject("no valid request");
    });
};
const availableBulbIdListFilter = (fullList, mapArray) => {
    let adjustedList = JSON.parse(JSON.stringify(fullList));
    mapArray.forEach((element) => {
        if (element.bulbId) {
            delete adjustedList[element.bulbId];
        }
    });
    return adjustedList;
};
exports.availableBulbIdListFilter = availableBulbIdListFilter;
const ControlDevice = function ({ SetValues }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (SetValues.sendToAndroid === "true") {
            (0, SendHandler_1.RebootToDownload)();
        }
        if (SetValues.readFileFromAndroid === "true") {
            (0, SendHandler_1.readFileFromAndroid)();
        }
        if (SetValues.createLightFile === "true") {
            const buildMapping = (mapName) => __awaiter(this, void 0, void 0, function* () {
                let bulbArray = [];
                let promise = new Promise((resolve, reject) => {
                    // db.all(`SELECT * FROM ${mapName}`, (err, table) => {
                    //   table.forEach((element) => {
                    //     if (element.bulbId) {
                    //       bulbArray.push(l[element.bulbId]);
                    //     }
                    //   });
                    //   resolve(table);
                    // });
                    const result = index_1.dbThree.prepare(`SELECT * FROM ${mapName}`).all();
                    result.forEach((element) => {
                        if (element.bulbId) {
                            bulbArray.push({
                                bulbId: SendHandler_3.l[element.bulbId],
                                brightness: element.brightness,
                                colors: element.colors,
                            });
                        }
                    });
                    resolve(result);
                });
                let waitingBulbArray = yield promise;
                (0, SendHandler_2.createFile)(SetValues.bulbMovement, SetValues.bulbColours, bulbArray);
                return bulbArray;
            });
            buildMapping((0, textConvert_1.textConvert)(SetValues.mapping));
        }
        return { notDefined: "bla" };
    });
};
/////////////////////////////////////Sven's//Coding/ Date: 26-11-2022 14:08 ////////////
// Users
/////////////////////////////////////////gnidoC//s'nevS////////////////////////////////
const createUser = function ({ userInput }) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        if (!validator_1.default.isEmail(userInput.emailAdress)) {
            errors.push({
                message: "email Adress is invalid",
            });
        }
        if (validator_1.default.isEmpty(userInput.password) ||
            !validator_1.default.isLength(userInput.password, { min: 4 })) {
            errors.push({ message: "Password to short" });
        }
        const existingUser = yield User_1.default.findOne({
            emailAdress: userInput.emailAdress,
        });
        if (existingUser) {
            const errors = new Error("user exist already!");
            throw errors;
        }
        const hashedPw = yield bcrypt_1.default.hash(userInput.password, 12);
        const user = new User_1.default({
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
        const createdUser = yield user.save();
        if (userInput.companyName) {
            sendEmail(userInput.emailAdress, userInput.yourName, userInput.companyName, userInput.aboutCompany);
        }
        return Object.assign(Object.assign({}, createdUser._doc), { _id: createdUser.id.toString() });
    });
};
const loginUser = function ({ emailAdress, password }) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findOne({ emailAdress: emailAdress });
        console.log(user);
        if (!user) {
            const error = new Error("user not found");
            error.code = 401;
            throw error;
        }
        const isEqual = yield bcrypt_1.default.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Password is incorrect.");
            error.code = 401;
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id.toString(),
            emailAdress: user.emailAdress,
        }, "process.env.SECRET_JWTyesiknowthisdoesnotworkbutatleastnowitsaveryhardkeytoguessifyoudontbelievemegiveitatrycloseyoureyesthinkofsomethingandifitisexactlythisstringiwillgiveyou2euro50andiwillbuyyouasnickers", { expiresIn: "365d" });
        return { token: token, userId: user._id.toString() };
    });
};
const betterSetTimeOut = (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done");
        }, time);
    });
};
const infoExtractor = (companyName) => __awaiter(void 0, void 0, void 0, function* () {
    let adress = "";
    let fileName;
    let hex = "#ff6900";
    // ColorFIlter
    const colorFilter = (colors) => {
        const diffNr = 20;
        colors.sort((a, b) => {
            return b.area - a.area;
        });
        for (let i = 0; i < colors.length; i++) {
            let total = colors[i].red + colors[i].green + colors[i].blue;
            let avg = total / 3;
            console.log("check", colors[i]);
            if (avg - colors[i].red > diffNr ||
                colors[i].red - avg > diffNr ||
                avg - colors[i].green > diffNr ||
                colors[i].green - avg > diffNr ||
                avg - colors[i].blue > diffNr ||
                colors[i].blue - avg > diffNr) {
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
    };
    const download = (url, fileName) => {
        https
            .get(url, res => {
            // Open file in local filesystem
            const file = fs_1.default.createWriteStream(fileName);
            // Write data into local file
            res.pipe(file);
            // Close the file
            file.on('finish', () => {
                file.close();
                console.log(`File downloaded!`);
            });
        })
            .on('error', err => {
            console.log('Error: ', err.message);
        });
    };
    yield axios.get('https://api.scaleserp.com/search', { params })
        .then(response => {
        // print the JSON response from Scale SERP
        __2.io.emit("infoExtractTest", JSON.stringify(response.data, 0, 2));
        search = JSON.stringify(response.data, 0, 2);
        adress = response.data.image_results[0].image;
        fileName = `brand${adress.slice(-5)}`;
        console.log(adress);
        download(adress, fileName);
    }).catch(error => {
        // catch and print the error
        console.log(error);
    });
    yield betterSetTimeOut(10000);
    console.log("chicdk");
    yield extractColors(fileName)
        .then((res) => (colorFilter(res)))
        .catch(console.error);
    return { hex: hex, fileName: fileName };
});
const sendEmail = (email, name, companyName, aboutCompany) => __awaiter(void 0, void 0, void 0, function* () {
    const params = yield infoExtractor(companyName);
    yield docCreator(name, companyName, params.hex, params.fileName);
    console.log(typeof email, email, "email");
    const mail = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: "Welcome to Bottle Luminous",
        attachments: [{
                path: "CVSvenDudink.pdf"
            }],
        text: `
      Welcome to Bottle Luminous`,
    };
    __1.transporter.sendMail(mail, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("done");
        }
    });
});
const docCreator = (name, companyName, hexColor, imageName) => __awaiter(void 0, void 0, void 0, function* () {
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
        .lineTo(0, 841.89)
        .lineTo(220, 841.89).lineTo(220, 180).lineTo(595.28, 180).lineTo(595.28, 50).lineTo(220, 50).lineTo(220, 0).lineTo(0, 0)
        .fill(hexColor);
    // draw some text
    //595.28 x 841.89
    doc.font('Archivo.ttf');
    doc.fillColor('#0c2e4d');
    doc.fontSize(10.6);
    doc.image("CVnoBackground.png", 0, 0, { width: 595.28 });
    doc.text(`Generated for ${name} from ${companyName}`, 270, 10);
    doc.image(imageName, 220, 5, { fit: [40, 40] });
    doc.end();
    yield doc.pipe(fs_1.default.createWriteStream("CVSvenDudink.pdf"));
    return "finished";
});
const graphqlResolver = {
    ControlDevice: ControlDevice,
    MapLamps: MapLamps,
    login: loginUser,
    createUser: createUser,
};
exports.graphqlResolver = graphqlResolver;
