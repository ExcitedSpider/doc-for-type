/** node script/doc-by-type.js --path <type-export-file> --type-name <type-name or *> --root <optional-file-root> */

import yargs from "yargs";
import { doc4Type, OuputFormat, supportFormat } from ".";

async function cliMain() {
  const { input = "", root = "", typeName, output, format } = yargs
    .options({
      input: {
        alias: ["p", "path"],
        type: "string",
        desc: "The path of input file",
        demandOption: true,
      },
      output: {
        alias: "o",
        desc: "The path of output file. If not provided, use inputdir and typename as output path",
        type: "string",
      },
      root: {
        alias: "r",
        desc: "The root of files",
        type: "string",
      },
      typeName: {
        alias: "t",
        type: "string",
        desc: "The type name that to be doc",
        demandOption: true,
      },
      format: {
        alias: "f",
        type: "string",
        default: "markdown",
        desc: `The doc format, one of: [${Object.keys(OuputFormat).join(",")}]`,
      },
    })
    .help().version().argv;

  const outputFormat = supportFormat[format] || OuputFormat.markdown;

  doc4Type({
    input,
    root,
    typeName,
    output,
    format: outputFormat || OuputFormat.markdown,
  });
}

cliMain();
