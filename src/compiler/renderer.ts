import ejs from "ejs";
import { readFileSync, writeFileSync } from "fs";

export const renderByEjs = (
  data: any,
  templatePath: string,
  saveFilePath: string
) => {
  const templateString = readFileSync(templatePath, { encoding: "utf-8" });

  const renderedString = ejs.render(templateString, data, {
    filename: templatePath,
  });

  console.log(renderedString);
  writeFileSync(saveFilePath, renderedString)
};
