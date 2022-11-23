import { RebootToDownload, readFileFromAndroid } from "../ADB/SendHandler";
import { createFile } from "../ADB/SendHandler";
import { l } from "../ADB/SendHandler";
import fs from "fs";
import { db } from "..";
import { textConvert } from "../Helper/textConvert";
import { lampActions } from "../Helper/mapEffects";
import { dbTwo, dbThree } from "../index";
import { preAlpha } from "../Helper/preAlpha";

let returnTable: any = [];

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
      SetMap.request === "resetServer"
    ) {
      resolve(lampActions({ SetMap }));
    } else if (SetMap.request === "directEvent") {
      resolve(preAlpha({ SetMap }));
    } else if (SetMap.request === "newMap") {
      const result = dbThree
        .prepare(
          `CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text)`
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
        mapArray: JSON.stringify(result),
        availableBulbIdList: availableBulbIdListFilter(l, result),
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
          `INSERT INTO ${SetMap.mapName} (id ,lat, lng, key, brightness) VALUES (?,?,?,?,?)`
        )
        .run(
          `${SetMap.bulbNumber}`,
          `${SetMap.lat}`,
          `${SetMap.lng}`,
          Math.random(),
          `${SetMap.brightness}`
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
          console.log(element.bulbId);
          if (element.bulbId) {
            bulbArray.push({
              bulbId: l[element.bulbId],
              brightness: element.brightness,
            });
          }
        });
        resolve(result);
      });
      let waitingBulbArray = await promise;

      createFile(SetValues.bulbMovement, SetValues.bulbColours, bulbArray);
      return bulbArray;
    };
    buildMapping(SetValues.mapping);
  }
  return { notDefined: "bla" };
};

const graphqlResolver = {
  ControlDevice: ControlDevice,
  MapLamps: MapLamps,
};

export { graphqlResolver };
