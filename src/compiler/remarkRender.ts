import { OuputFormat } from "./type";
import { writeFileSync, existsSync } from "fs";
import { parse } from "path";
import mkdirp from "mkdirp";
import { extName } from "./const";

/** 输入 markdown 或者 json 字符串，转换后输出到 fs */
export const remarkRender = (
  outputString: string,
  outputPath: string,
  outputFormat: OuputFormat
) => {
  const transformedString = {
    [OuputFormat.json]: () => outputString,
    [OuputFormat.markdown]: () => outputString,
  }[outputFormat]();

  const pathObj = parse(outputPath)
  const ext = extName[outputFormat];

  if (!pathObj.ext) {
    outputString = outputString + ext
  }

  if (!existsSync(pathObj.dir)) {
    mkdirp(pathObj.dir).then(() => {
      writeFileSync(outputString, transformedString);
    });
  } else {
    writeFileSync(outputString, transformedString);
  }
};
