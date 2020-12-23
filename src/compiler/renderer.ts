import ejs from "ejs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname } from "path";
import { TypeDocData } from './type'
import mkdirp from "mkdirp";

export const renderByEjs = (
  data: TypeDocData,
  templatePath: string,
  saveFilePath: string
) => {
  const templateString = readFileSync(templatePath, { encoding: "utf-8" });

  const renderedString = ejs.render(templateString, data, {
    filename: templatePath,
  });

  const dirPath = dirname(saveFilePath);

  if (!existsSync(dirPath)) {
    mkdirp(dirPath).then(()=>{
      writeFileSync(saveFilePath, renderedString)
    });
  } else {
    writeFileSync(saveFilePath, renderedString);
  }
};
