import ejs from "ejs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { parse } from "path";
import { TypeDocData, OuputFormat } from "./type";
import mkdirp from "mkdirp";

import { extName } from "./const";

export const renderByEjs = (
  data: TypeDocData,
  templatePath: string,
  saveFilePath: string,
  outputFormat: OuputFormat
) => {
  const renderedString = {
    [OuputFormat.markdown]: () => {
      const templateString = readFileSync(templatePath, { encoding: "utf-8" });

      const renderedString = ejs.render(templateString, data, {
        filename: templatePath,
      });

      return renderedString;
    },
    [OuputFormat.json]: () => {
      return JSON.stringify(data, null, 2);
    },
  }[outputFormat]();

  const pathObj = parse(saveFilePath)
  const ext = extName[outputFormat];

  if (!pathObj.ext) {
    saveFilePath = saveFilePath + ext
  }

  if (!existsSync(pathObj.dir)) {
    mkdirp(pathObj.dir).then(() => {
      writeFileSync(saveFilePath, renderedString);
    });
  } else {
    writeFileSync(saveFilePath, renderedString);
  }
};
