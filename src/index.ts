import { flowRight, curryRight } from "lodash";
import { join, dirname, resolve } from "path";
import { normalize } from "./compiler/normalize";
import { generateSchema } from "./compiler/generateSchema";
import { getDocDataFromNormalized } from "./compiler/getDocData";
import { renderer } from "./compiler/renderer";
import { errorLogger, successLogger } from "./compiler/logger";
import { OuputFormat } from "./compiler/type";
import { write2fs } from "./compiler/writer2fs";
import { supportFormat } from './compiler/const'

export * from "./compiler/type";
export * from "./compiler/const";

export const THEME_PATH = resolve(__dirname, "./theme");

export async function doc4Type(option: {
  path: string;
  root: string;
  typeName: string;
  output?: string;
  format: OuputFormat | 'markdown'| 'md' | 'json' | 'html';
}) {
  const { path, root, typeName, output, format } = option;
  const docPath = output || join(dirname(path), "schema");

  let outputFormat = OuputFormat.markdown;

  if (typeof format === "number") {
    outputFormat = format;
  } else {
    outputFormat = supportFormat[format] || OuputFormat.markdown;
  }

  const getTypeDocDataFromFile = flowRight([
    curryRight(write2fs)(outputFormat, docPath),
    curryRight(renderer)(outputFormat),
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
      format: outputFormat,
    });
  } catch (error) {
    errorLogger(error);
  }
}
