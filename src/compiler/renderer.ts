import ejs from "ejs";
import { readFileSync } from "fs";
import { TypeDocData, OuputFormat } from "./type";
import remark from "remark";
import mdParse from "remark-parse";
import html from "remark-html";

const guide = require("remark-preset-lint-markdown-style-guide");

import templatePath from "../../public/template/type-doc.ejs";

export const renderer = (data: TypeDocData, format: OuputFormat) => {
  return {
    [OuputFormat.markdown]: () => {
      return remarkRender(ejsRender(data), format);
    },
    [OuputFormat.html]: () => {
      return remarkRender(ejsRender(data), format);
    },
    [OuputFormat.json]: () => {
      return JSON.stringify(data, null, 2);
    },
  }[format]();
};

/** 输入 JSON 对象，输出 Markdown 字符串 */
const ejsRender = (data: TypeDocData) => {
  const templateString = readFileSync(templatePath, { encoding: "utf-8" });

  const renderedString = ejs.render(templateString, data, {
    filename: templatePath,
  });

  return renderedString;
};

/** 输入 markdown，用 remark 编译成 markdown 或 html  */
const remarkRender = (rawMarkdown: string, outputFormat: OuputFormat) => {
  const transformedString = {
    [OuputFormat.json]: () => rawMarkdown,
    [OuputFormat.markdown]: () => {
      /** use remark to lint md */
      const vFile = remark()
        .use(guide)
        .use(mdParse)
        .processSync(rawMarkdown);
      return String(vFile);
    },
    [OuputFormat.html]: () => {
      /** use remark to generate html */
      const vFile = remark()
        .use(mdParse)
        .use(html)
        .processSync(rawMarkdown);
      return String(vFile);
    },
  }[outputFormat]();

  return transformedString;
};
