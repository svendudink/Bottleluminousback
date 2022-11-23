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
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlResolver = exports.availableBulbIdListFilter = void 0;
const SendHandler_1 = require("../ADB/SendHandler");
const SendHandler_2 = require("../ADB/SendHandler");
const SendHandler_3 = require("../ADB/SendHandler");
const textConvert_1 = require("../Helper/textConvert");
const mapEffects_1 = require("../Helper/mapEffects");
const index_1 = require("../index");
const preAlpha_1 = require("../Helper/preAlpha");
let returnTable = [];
const MapLamps = function ({ SetMap }) {
    return new Promise((resolve, reject) => {
        SetMap.mapName = (0, textConvert_1.textConvert)(SetMap.mapName);
        if (SetMap.request === "verticalScan" ||
            SetMap.request === "horizontalScan" ||
            SetMap.request === "deleteActive" ||
            SetMap.request === "addLampBeforeActive" ||
            SetMap.request === "Hottest" ||
            SetMap.request === "brightness" ||
            SetMap.request === "resetServer") {
            resolve((0, mapEffects_1.lampActions)({ SetMap }));
        }
        else if (SetMap.request === "directEvent") {
            resolve((0, preAlpha_1.preAlpha)({ SetMap }));
        }
        else if (SetMap.request === "newMap") {
            const result = index_1.dbThree
                .prepare(`CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text)`)
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
                mapArray: JSON.stringify(result),
                availableBulbIdList: (0, exports.availableBulbIdListFilter)(SendHandler_3.l, result),
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
                .prepare(`INSERT INTO ${SetMap.mapName} (id ,lat, lng, key, brightness) VALUES (?,?,?,?,?)`)
                .run(`${SetMap.bulbNumber}`, `${SetMap.lat}`, `${SetMap.lng}`, Math.random(), `${SetMap.brightness}`);
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
                        console.log(element.bulbId);
                        if (element.bulbId) {
                            bulbArray.push({
                                bulbId: SendHandler_3.l[element.bulbId],
                                brightness: element.brightness,
                            });
                        }
                    });
                    resolve(result);
                });
                let waitingBulbArray = yield promise;
                (0, SendHandler_2.createFile)(SetValues.bulbMovement, SetValues.bulbColours, bulbArray);
                return bulbArray;
            });
            buildMapping(SetValues.mapping);
        }
        return { notDefined: "bla" };
    });
};
const graphqlResolver = {
    ControlDevice: ControlDevice,
    MapLamps: MapLamps,
};
exports.graphqlResolver = graphqlResolver;
