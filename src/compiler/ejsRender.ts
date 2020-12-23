import ejs from "ejs";
import { readFileSync } from "fs";
import { TypeDocData, OuputFormat } from "./type";

import templatePath from "../../public/template/type-doc.ejs";

/** 输入 JSON 对象，输出 JSON 或 Markdown 字符串 */
export const ejsRender = (
  data: TypeDocData,
  outputFormat: OuputFormat
) => {
  return {
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
};
