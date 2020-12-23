import { flowRight, curryRight } from "lodash";
import { join, dirname } from "path";
import { normalize } from "./normalize";
import { generateSchema } from "./generateSchema";
import { getDocDataFromNormalized } from "./getDocData";
import { renderByEjs } from "./primativeRender";
import { errorLogger, successLogger } from "./logger";
import templatePath from "../../public/template/type-doc.ejs";
import { OuputFormat } from "./type";

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
      format,
    });
  } catch (error) {
    errorLogger(error);
  }
}
