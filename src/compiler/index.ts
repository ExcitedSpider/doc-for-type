/** node script/doc-by-type.js --path <type-export-file> --type-name <type-name or *> --root <optional-file-root> */
import * as yargs from "yargs";
import { normalize } from "./normalize";
import { generateSchema } from "./generateSchame";
import { getDocDataFromNormalized } from "./getDocData";
import { renderByEjs } from "./renderer";
import { flow, curryRight } from "lodash";
import { join } from "path";

async function main() {
  const { path: filePath = "", root: fileRoot = "", typeName, menu } = yargs
    .option("path", {
      alias: "p",
      type: "string",
      demandOption: true,
    })
    .option("root", {
      alias: "r",
      type: "string",
    })
    .option("typeName", {
      alias: "t",
      type: "string",
      demandOption: true,
    })
    .option("menu", {
      alias: "m",
      type: "string",
    }).argv;

  const getTypeDocDataFromFile = flow([
    generateSchema,
    normalize,
    curryRight(getDocDataFromNormalized)(typeName || "MainType"),
    curryRight(renderByEjs)(join(__dirname, "../src/template/type-doc.ejs"), join(__dirname, `../docs/${typeName}.md`)),
  ]);

  const schema = getTypeDocDataFromFile(filePath, fileRoot, typeName);

  console.log(JSON.stringify(schema, null, 2));
}

main();
