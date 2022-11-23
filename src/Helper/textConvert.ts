export function textConvert(input) {
  if (input.includes("UNIS20")) {
    let output = input.replaceAll("UNIS20", " ");
  }
  let output = input.replaceAll(" ", "UNIS20");
  console.log("testingh", output);

  return output;
}
