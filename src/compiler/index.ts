import { flowRight, curryRight } from "lodash";
import { join, dirname } from "path";
import { normalize } from "./normalize";
import { generateSchema } from "./generateSchema";
import { getDocDataFromNormalized } from "./getDocData";
import { renderer } from "./renderer";
import { errorLogger, successLogger } from "./logger";
import { OuputFormat } from "./type";
import { write2fs } from './writer2fs'

export * from "./type";
export * from "./const";

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
