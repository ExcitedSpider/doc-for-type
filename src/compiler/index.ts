/** node script/doc-by-type.js --path <type-export-file> --type-name <type-name or *> --root <optional-file-root> */
import * as yargs from "yargs";
import { flowRight, curryRight } from "lodash";
import { join, dirname } from "path";
import { normalize } from "./normalize";
import { generateSchema } from "./generateSchema";
import { getDocDataFromNormalized } from "./getDocData";
import { renderByEjs } from "./primativeRender";
import { errorLogger, successLogger } from "./logger";
import templatePath from "../../public/template/type-doc.ejs";
import { OuputFormat } from "./type";

export async function doc4Type(option: {
  path: string;
  root: string;
  typeName: string;
  menu?: string;
  output?: string;
  format: OuputFormat;
}) {
  const { path, root, typeName, menu, output, format } = option;
  const docPath = output || join(dirname(path), "schema");

  const getTypeDocDataFromFile = flowRight([
    curryRight(renderByEjs)(templatePath, docPath, format),
    curryRight(getDocDataFromNormalized)(typeName),
    normalize,
    generateSchema,
  ]);

  try {
    getTypeDocDataFromFile(path, root, typeName);
    successLogger({
      path,
      root,
      typeName,
      output,
      menu: menu || ".",
      format,
    });
  } catch (error) {
    errorLogger(error);
  }
}

const supportFormat: { [index: string]: OuputFormat } = {
  markdown: OuputFormat.markdown,
  json: OuputFormat.json,
  md: OuputFormat.markdown,
};

async function cliMain() {
  const { path = "", root = "", typeName, menu, output, format } = yargs
    .options({
      path: {
        alias: "p",
        type: "string",
        demandOption: true,
      },
      output: {
        alias: "o",
        type: "string",
      },
      root: {
        alias: "r",
        type: "string",
      },
      typeName: {
        alias: "t",
        type: "string",
        demandOption: true,
      },
      menu: {
        alias: "m",
        type: "string",
      },
      format: {
        alias: "f",
        type: "string",
        default: "markdown",
      },
    })
    .help().argv;

  const outputFormat = supportFormat[format] || OuputFormat.markdown;

  doc4Type({
    path,
    root,
    typeName,
    menu,
    output,
    format: outputFormat || OuputFormat.markdown,
  });
}

if (process.env.APP_TARGET === "CLI") {
  cliMain();
}
