"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textConvert = void 0;
function textConvert(input) {
    if (input.includes("UNIS20")) {
        let output = input.replaceAll("UNIS20", " ");
    }
    let output = input.replaceAll(" ", "UNIS20");
    console.log("testingh", output);
    return output;
}
exports.textConvert = textConvert;
