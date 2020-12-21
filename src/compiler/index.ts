/** node script/doc-by-type.js --path <type-export-file> --type-name <type-name or *> --root <optional-file-root> */
import * as yargs from "yargs";
import { flow, curryRight } from "lodash";
import { join } from "path";
import { normalize } from "./normalize";
import { generateSchema } from "./generateSchema";
import { getDocDataFromNormalized } from "./getDocData";
import { renderByEjs } from "./renderer";
import { successLogger, errorLogger } from "./logger";
import templatePath from "../../public/template/type-doc.ejs";

export async function doc4Type(option: {
  path: string;
  root: string;
  typeName: string;
  menu?: string;
  output?: string;
}) {
  const { path, root, typeName, menu, output } = option;
  const docPath =
    output || join(__dirname, "../../docs", menu || "", `${typeName}.md`);

  const getTypeDocDataFromFile = flow([
    generateSchema,
    normalize,
    curryRight(getDocDataFromNormalized)(
      (typeName || "MainType") as any
    ) as any,
    curryRight(renderByEjs)(templatePath, docPath),
  ]);

  try {
    getTypeDocDataFromFile(path, root, typeName);
    successLogger({
      path,
      root,
      typeName,
      menu: menu || ".",
    });
  } catch (error) {
    errorLogger(error);
  }
}

async function cliMain() {
  const { path = "", root = "", typeName, menu, output } = yargs
    .option("path", {
      alias: "p",
      type: "string",
      demandOption: true,
    })
    .option("output", {
      alias: "o",
      type: "string",
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

  doc4Type({
    path,
    root,
    typeName,
    menu,
    output,
  });
}

if (process.env.APP_TARGET === "CLI") {
  cliMain();
}
