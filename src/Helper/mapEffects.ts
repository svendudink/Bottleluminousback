import { db } from "..";
import { availableBulbIdListFilter } from "../graphql/resolvers";
import { l } from "../ADB/SendHandler";
import { dbTwo, dbThree } from "../index";
import { json } from "body-parser";

export const lampActions = async ({ SetMap }: any) => {
  return new Promise((resolve, reject) => {
    console.log("request", SetMap.request);
    // Change all IDS to random values
    let scantype = "";

    console.log(SetMap.request);

    const scan = async (scantype: string) => {
      return new Promise((resolve, reject) => {
        let newId = 0;
        let tempId = 1000;
        let finishCheck = 0;

        console.log("scan");

        const result = dbThree
          .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY ${scantype}`)
          .all();

        result.map((el) => {
          el.id = (newId = newId + 1).toString();
        });
        dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
        dbThree
          .prepare(
            `CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text, colors text )`
          )
          .run();

        const build = dbThree.prepare(
          `INSERT INTO ${SetMap.mapName} (id ,lat, lng, bulbId, key, brightness, colors) VALUES (@id , @lat, @lng, @bulbId, @key, @brightness, @colors)`
        );
        const insertMultiple = dbThree.transaction((lamps) => {
          for (const lamp of lamps) build.run(lamp);
        });
        insertMultiple(result);
        console.log("r");
        const load = dbThree
          .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
          .all();
        resolve({
          bulbIdList: JSON.stringify(availableBulbIdListFilter(l, load)),
          mapArray: JSON.stringify(load),
          availableBulbIdList: availableBulbIdListFilter(l, load),
        });
      });
    };

    const deleteActive = async () => {
      return new Promise((resolve, reject) => {
        dbThree
          .prepare(
            `DELETE FROM ${SetMap.mapName} WHERE id = ${SetMap.bulbNumber}`
          )
          .run();

        const result = dbThree
          .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
          .all();

        result.map((el) => {
          if (Number(el.id) >= Number(SetMap.bulbNumber)) {
            el.id = (el.id - 1).toString();
          }
        });

        dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
        dbThree
          .prepare(
            `CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text, colors text)`
          )
          .run();

        console.log(result);

        const build = dbThree.prepare(
          `INSERT INTO ${SetMap.mapName} (id ,lat, lng, bulbId, key, brightness, colors) VALUES (@id , @lat, @lng, @bulbId, @key, @brightness, @colors)`
        );
        const insertMultiple = dbThree.transaction((lamps) => {
          for (const lamp of lamps) build.run(lamp);
        });
        insertMultiple(result);

        const load = dbThree
          .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
          .all();
        resolve({
          bulbIdList: JSON.stringify(availableBulbIdListFilter(l, load)),
          mapArray: JSON.stringify(load),
          availableBulbIdList: availableBulbIdListFilter(l, load),
        });
      });
    };

    const addLampBeforeActive = async () => {
      return new Promise((resolve, reject) => {
        console.log("bulbnr", SetMap.bulbNumber);
        const result = dbThree
          .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
          .all();

        console.log("result1", result);

        result.map((el) => {
          console.log(
            "check compare",
            el.id,
            SetMap.bulbNumber,
            el.id >= SetMap.bulbNumber
          );
          if (Number(el.id) >= Number(SetMap.bulbNumber)) {
            el.id = (Number(el.id) + 1).toString();
            console.log(el.id);
          }
        });

        console.log("result2", result);

        dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
        dbThree
          .prepare(
            `CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text, colors text)`
          )
          .run();

        const build = dbThree.prepare(
          `INSERT INTO ${SetMap.mapName} (id ,lat, lng, bulbId, key, brightness, colors) VALUES (@id , @lat, @lng, @bulbId, @key, @brightness @colors)`
        );
        const insertMultiple = dbThree.transaction((lamps) => {
          for (const lamp of lamps) build.run(lamp);
        });
        insertMultiple([...result]);

        dbThree
          .prepare(
            `INSERT INTO ${SetMap.mapName} (id ,lat, lng, key, brightness) VALUES (?,?,?,?,?)`
          )
          .run(
            `${SetMap.bulbNumber}`,
            `${SetMap.lat}`,
            `${SetMap.lng}`,
            Math.random(),
            `${"100"}`,
            "[]"
          );

        const load = dbThree
          .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
          .all();
        resolve({
          bulbIdList: JSON.stringify(availableBulbIdListFilter(l, load)),
          mapArray: JSON.stringify(load),
          availableBulbIdList: availableBulbIdListFilter(l, load),
        });
      });
    };

    const hottest = async () => {
      console.log("check");
      const result = dbThree
        .prepare(`UPDATE ${SetMap.mapName} SET id = ? WHERE id = ?`)
        .run(`${"1"}`, `${SetMap.bulbNumber}`);

      console.log(result);
    };

    const brightness = () => {
      console.log("check");
      const result = dbThree
        .prepare(`UPDATE ${SetMap.mapName} SET brightness = ? WHERE id = ?`)
        .run(`${SetMap.brightness}`, `${SetMap.bulbNumber}`);

      const load = dbThree
        .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
        .all();
      resolve({
        bulbIdList: JSON.stringify(availableBulbIdListFilter(l, load)),
        mapArray: JSON.stringify(load),
        availableBulbIdList: availableBulbIdListFilter(l, load),
      });
    };

    const addColor = () => {
      let colorArr = [];
      const initialLoad = dbThree
        .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
        .all();
      let lamp = initialLoad.find((lamp) => lamp.id === SetMap.bulbNumber);
      let colors = JSON.stringify(lamp.colors);
      console.log("boter");
      if (!colors.includes(SetMap.extended)) {
        if (colors === "null") {
          colorArr.push(SetMap.extended);
          console.log(colorArr, SetMap.bulbNumber);
          console.log("if null");
        } else {
          let colors = JSON.parse(lamp.colors);

          console.log(colors, typeof colors);
          console.log("color is not selected");
          colors.push(SetMap.extended);
          colorArr = colors;
        }
      } else {
        console.log("color is allready selected ");
        let colors = JSON.parse(lamp.colors);
        colorArr = colors.filter((e) => e !== SetMap.extended);
      }
      console.log(colorArr);
      const result = dbThree
        .prepare(`UPDATE ${SetMap.mapName} SET colors = ? WHERE id = ?`)
        .run(`${JSON.stringify(colorArr)}`, `${SetMap.bulbNumber}`);

      const load = dbThree
        .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
        .all();
      resolve({
        bulbIdList: JSON.stringify(availableBulbIdListFilter(l, load)),
        mapArray: JSON.stringify(load),
        availableBulbIdList: availableBulbIdListFilter(l, load),
      });
    };

    if (SetMap.request === "horizontalScan") {
      resolve(scan("lat DESC"));
    } else if (SetMap.request === "verticalScan") {
      resolve(scan("lng ASC"));
    } else if (SetMap.request === "deleteActive") {
      resolve(deleteActive());
    } else if (SetMap.request === "addLampBeforeActive") {
      resolve(addLampBeforeActive());
    } else if (SetMap.request === "brightness") {
      resolve(brightness());
    } else if (SetMap.request === "addColor") {
      resolve(addColor());
    }
  });
};
