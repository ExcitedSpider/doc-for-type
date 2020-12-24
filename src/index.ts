import { flowRight, curryRight } from "lodash";
import { join, dirname, resolve } from "path";
import { normalize } from "./compiler/normalize";
import { generateSchema } from "./compiler/generateSchema";
import { getDocDataFromNormalized } from "./compiler/getDocData";
import { renderer } from "./compiler/renderer";
import { errorLogger, successLogger } from "./compiler/logger";
import { OuputFormat } from "./compiler/type";
import { write2fs } from "./compiler/writer2fs";

export * from "./compiler/type";
export * from "./compiler/const";

export const THEME_PATH = resolve(__dirname, "./theme");

export async function doc4Type(option: {
  path: string;
  root: string;
  typeName: string;
  output?: string;
  format: OuputFormat;
}) {
  const { path, root, typeName, output, format } = option;
  const docPath = output || join(dirname(path), "schema");

  const getTypeDocDataFromFile = flowRight([
    curryRight(write2fs)(format, docPath),
    curryRight(renderer)(format),
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
      format,
    });
  } catch (error) {
    errorLogger(error);
  }
}
