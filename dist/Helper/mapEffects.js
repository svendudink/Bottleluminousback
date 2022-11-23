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
exports.lampActions = void 0;
const resolvers_1 = require("../graphql/resolvers");
const SendHandler_1 = require("../ADB/SendHandler");
const index_1 = require("../index");
const lampActions = ({ SetMap }) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        console.log("request", SetMap.request);
        // Change all IDS to random values
        let scantype = "";
        console.log(SetMap.request);
        const scan = (scantype) => __awaiter(void 0, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let newId = 0;
                let tempId = 1000;
                let finishCheck = 0;
                console.log("scan");
                const result = index_1.dbThree
                    .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY ${scantype}`)
                    .all();
                result.map((el) => {
                    el.id = (newId = newId + 1).toString();
                });
                index_1.dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
                index_1.dbThree
                    .prepare(`CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE)`)
                    .run();
                const build = index_1.dbThree.prepare(`INSERT INTO ${SetMap.mapName} (id ,lat, lng, bulbId, key) VALUES (@id , @lat, @lng, @bulbId, @key)`);
                const insertMultiple = index_1.dbThree.transaction((lamps) => {
                    for (const lamp of lamps)
                        build.run(lamp);
                });
                insertMultiple(result);
                console.log("r");
                const load = index_1.dbThree
                    .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                    .all();
                resolve({
                    bulbIdList: JSON.stringify((0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load)),
                    mapArray: JSON.stringify(load),
                    availableBulbIdList: (0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load),
                });
            });
        });
        const deleteActive = () => __awaiter(void 0, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                index_1.dbThree
                    .prepare(`DELETE FROM ${SetMap.mapName} WHERE id = ${SetMap.bulbNumber}`)
                    .run();
                const result = index_1.dbThree
                    .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                    .all();
                result.map((el) => {
                    if (Number(el.id) >= Number(SetMap.bulbNumber)) {
                        el.id = (el.id - 1).toString();
                    }
                });
                index_1.dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
                index_1.dbThree
                    .prepare(`CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text)`)
                    .run();
                console.log(result);
                const build = index_1.dbThree.prepare(`INSERT INTO ${SetMap.mapName} (id ,lat, lng, bulbId, key, brightness) VALUES (@id , @lat, @lng, @bulbId, @key, @brightness)`);
                const insertMultiple = index_1.dbThree.transaction((lamps) => {
                    for (const lamp of lamps)
                        build.run(lamp);
                });
                insertMultiple(result);
                const load = index_1.dbThree
                    .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                    .all();
                resolve({
                    bulbIdList: JSON.stringify((0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load)),
                    mapArray: JSON.stringify(load),
                    availableBulbIdList: (0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load),
                });
            });
        });
        //   await db.all(
        //     `DELETE FROM ${SetMap.mapName} WHERE id = ${SetMap.bulbNumber}`
        //   );
        //   await db.all(
        //     `SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`,
        //     (err, table) => {
        //       table.map(async (element, index) => {
        //         console.log(element);
        //         await db.run(
        //           `UPDATE ${SetMap.mapName} SET id = ? WHERE key = ?`,
        //           [
        //             `${
        //               SetMap.bulbNumber > Number(element.id)
        //                 ? Number(element.id)
        //                 : Number(element.id) + 1000
        //             }`,
        //             `${element.key}`,
        //           ],
        //           (err, table) => {
        //             console.log(err);
        //           }
        //         );
        //       });
        //     }
        //   );
        //   setTimeout(() => {
        //     db.all(
        //       `SELECT lng, lat, bulbId, id FROM ${SetMap.mapName}`,
        //       (err, table) => {
        //         table.map(async (element, index, oldArr) => {
        //           let temp;
        //           console.log(
        //             "current element being worked on",
        //             element.id,
        //             element
        //           );
        //           if (Number(element.id) >= 1000) {
        //             temp = JSON.parse(JSON.stringify(Number(element.id) - 1001));
        //             console.log("whatis", temp);
        //           } else {
        //             temp = element.id;
        //             console.log("validate");
        //           }
        //           console.log("what2", temp, element.id);
        //           await db.run(
        //             `UPDATE ${SetMap.mapName} SET id = ? WHERE id = ?`,
        //             [`${temp}`, `${element.id}`],
        //             (err, table) => {
        //               console.log(err);
        //             }
        //           );
        //         });
        //       }
        //     );
        //   }, 900);
        //   setTimeout(() => {
        //     db.all(
        //       `SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`,
        //       (err, table) => {
        //         if (err) {
        //           reject(err);
        //         }
        //         resolve({
        //           bulbIdList: JSON.stringify(availableBulbIdListFilter(l, table)),
        //           mapArray: JSON.stringify(table),
        //           availableBulbIdList: availableBulbIdListFilter(l, table),
        //         });
        //       }
        //     );
        //   }, 1500);
        const addLampBeforeActive = () => __awaiter(void 0, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                console.log("bulbnr", SetMap.bulbNumber);
                const result = index_1.dbThree
                    .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                    .all();
                console.log("result1", result);
                result.map((el) => {
                    console.log("check compare", el.id, SetMap.bulbNumber, el.id >= SetMap.bulbNumber);
                    if (Number(el.id) >= Number(SetMap.bulbNumber)) {
                        el.id = (Number(el.id) + 1).toString();
                        console.log(el.id);
                    }
                });
                console.log("result2", result);
                index_1.dbThree.prepare(`DROP TABLE ${SetMap.mapName}`).run();
                index_1.dbThree
                    .prepare(`CREATE TABLE ${SetMap.mapName} (id text UNIQUE, lat text,lng text, bulbId text UNIQUE, key text UNIQUE, brightness text)`)
                    .run();
                const build = index_1.dbThree.prepare(`INSERT INTO ${SetMap.mapName} (id ,lat, lng, bulbId, key, brightness) VALUES (@id , @lat, @lng, @bulbId, @key, @brightness)`);
                const insertMultiple = index_1.dbThree.transaction((lamps) => {
                    for (const lamp of lamps)
                        build.run(lamp);
                });
                insertMultiple([...result]);
                index_1.dbThree
                    .prepare(`INSERT INTO ${SetMap.mapName} (id ,lat, lng, key, brightness) VALUES (?,?,?,?,?)`)
                    .run(`${SetMap.bulbNumber}`, `${SetMap.lat}`, `${SetMap.lng}`, Math.random(), `${"100"}`);
                const load = index_1.dbThree
                    .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                    .all();
                resolve({
                    bulbIdList: JSON.stringify((0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load)),
                    mapArray: JSON.stringify(load),
                    availableBulbIdList: (0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load),
                });
            });
            // // await db.all(
            // //         `DELETE FROM ${SetMap.mapName} WHERE id = ${SetMap.bulbNumber}`
            // //       );
            // await db.all(
            //   `SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`,
            //   (err, table) => {
            //     table.map(async (element, index) => {
            //       console.log(element);
            //       await db.run(
            //         `UPDATE ${SetMap.mapName} SET id = ? WHERE key = ?`,
            //         [
            //           `${
            //             SetMap.bulbNumber > Number(element.id)
            //               ? Number(element.id)
            //               : Number(element.id) + 1000
            //           }`,
            //           `${element.key}`,
            //         ],
            //         (err, table) => {
            //           console.log(err);
            //         }
            //       );
            //     });
            //   }
            // );
            // setTimeout(() => {
            //   db.all(
            //     `SELECT lng, lat, bulbId, id FROM ${SetMap.mapName}`,
            //     (err, table) => {
            //       table.map(async (element, index, oldArr) => {
            //         let temp;
            //         console.log(
            //           "current element being worked on",
            //           element.id,
            //           element
            //         );
            //         if (Number(element.id) >= 1000) {
            //           temp = JSON.parse(JSON.stringify(Number(element.id) - 999));
            //           console.log("whatis", temp);
            //         } else {
            //           temp = element.id;
            //           console.log("validate");
            //         }
            //         console.log("what2", temp, element.id);
            //         await db.run(
            //           `UPDATE ${SetMap.mapName} SET id = ? WHERE id = ?`,
            //           [`${temp}`, `${element.id}`],
            //           (err, table) => {
            //             console.log(err);
            //           }
            //         );
            //       });
            //     }
            //   );
            //   db.run(
            //     `INSERT INTO ${SetMap.mapName} (id ,lat, lng, key) VALUES (?,?,?,?)`,
            //     [
            //       `${SetMap.bulbNumber}`,
            //       `${SetMap.lat}`,
            //       `${SetMap.lng}`,
            //       Math.random(),
            //     ],
            //     (err, table) => {
            //       if (err) {
            //         reject(err);
            //         console.log(err);
            //       }
            //     }
            //   );
            // }, 900);
            // setTimeout(() => {
            //   db.all(
            //     `SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`,
            //     (err, table) => {
            //       if (err) {
            //         reject(err);
            //       }
            //       resolve({
            //         bulbIdList: JSON.stringify(availableBulbIdListFilter(l, table)),
            //         mapArray: JSON.stringify(table),
            //         availableBulbIdList: availableBulbIdListFilter(l, table),
            //       });
            //     }
            //   );
            // }, 1500);
        });
        const hottest = () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("check");
            const result = index_1.dbThree
                .prepare(`UPDATE ${SetMap.mapName} SET id = ? WHERE id = ?`)
                .run(`${"1"}`, `${SetMap.bulbNumber}`);
            console.log(result);
            //   const insert = dbThree.prepare(
            //     "INSERT INTO cats (name, age) VALUES (@name, @age)"
            //   );
            //   const insertMany = dbThree.transaction((cats) => {
            //     for (const cat of cats) insert.run(cat);
            //   });
            //   insertMany([
            //     { name: "Joey", age: 2 },
            //     { name: "Sally", age: 4 },
            //     { name: "Junior", age: 1 },
            //   ]);
            //   const newExpense = dbThree.prepare(
            //     "INSERT INTO expenses (note, dollars) VALUES (?, ?)"
            //   );
            //   const adopt = dbThree.transaction((cats) => {
            //     newExpense.run("adoption fees", 20);
            //     insertMany(cats); // nested transaction
            //   });
        });
        const brightness = () => {
            console.log("check");
            const result = index_1.dbThree
                .prepare(`UPDATE ${SetMap.mapName} SET brightness = ? WHERE id = ?`)
                .run(`${SetMap.brightness}`, `${SetMap.bulbNumber}`);
            const load = index_1.dbThree
                .prepare(`SELECT * FROM ${SetMap.mapName} ORDER BY id + 0 ASC`)
                .all();
            resolve({
                bulbIdList: JSON.stringify((0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load)),
                mapArray: JSON.stringify(load),
                availableBulbIdList: (0, resolvers_1.availableBulbIdListFilter)(SendHandler_1.l, load),
            });
        };
        if (SetMap.request === "horizontalScan") {
            resolve(scan("lat DESC"));
        }
        else if (SetMap.request === "verticalScan") {
            resolve(scan("lng ASC"));
        }
        else if (SetMap.request === "deleteActive") {
            resolve(deleteActive());
        }
        else if (SetMap.request === "addLampBeforeActive") {
            resolve(addLampBeforeActive());
        }
        else if (SetMap.request === "brightness") {
            resolve(brightness());
        }
    });
});
exports.lampActions = lampActions;
