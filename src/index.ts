import { flowRight, curryRight } from "lodash";
import { join, dirname, resolve } from "path";
import { normalize } from "./compiler/normalize";
import { generateSchema } from "./compiler/generateSchema";
import { getDocDataFromNormalized } from "./compiler/getDocData";
import { renderer } from "./compiler/renderer";
import { errorLogger, successLogger } from "./compiler/logger";
import { OuputFormat, APIOption } from "./compiler/type";
import { write2fs } from "./compiler/writer2fs";
import { supportFormat } from './compiler/const'

export * from "./compiler/type";
export * from "./compiler/const";

export const THEME_PATH = resolve(__dirname, "./theme");

export async function doc4Type(option: APIOption) {
  const { input: path, root, typeName, output, format, title } = option;
  const docPath = output || join(dirname(path), option.typeName);

  let outputFormat = OuputFormat.markdown;

  if (typeof format === "number") {
    outputFormat = format;
  } else if(format){
    outputFormat = supportFormat[format] || OuputFormat.markdown;
  }

  let docTitle = title || typeName

  const getTypeDocDataFromFile = flowRight([
    curryRight(write2fs)(outputFormat, docPath),
    curryRight(renderer)(outputFormat, docTitle),
    curryRight(getDocDataFromNormalized)(typeName),
    normalize,
    generateSchema,
  ]);

  try {
    getTypeDocDataFromFile(path, root, typeName);
    successLogger({
      path,
      typeName,
      output: docPath,
    });
  } catch (error) {
    errorLogger(error);
  }
}
