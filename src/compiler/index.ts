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

  const docPath = join(__dirname, '../docs', menu || '', `${typeName}.md`)
  const templatePath = join(__dirname, "../src/template/type-doc.ejs")

  const getTypeDocDataFromFile = flow([
    generateSchema,
    normalize,
    curryRight(getDocDataFromNormalized)(typeName || "MainType"),
    curryRight(renderByEjs)(templatePath, docPath),
  ]);

  getTypeDocDataFromFile(filePath, fileRoot, typeName)
}

main();
