import { writeFileSync, existsSync } from "fs";
import { parse, format } from "path";
import { extNameMap } from "./const";
import { OuputFormat } from "./type";
import mkdir from "mkdirp";

export const write2fs = (
  source: string,
  outputFormat: OuputFormat,
  path: string
) => {
  const pathObj = parse(path);

  if (!existsSync(pathObj.dir)) {
    mkdir(pathObj.dir);
  }

  if(!pathObj.ext){
    path = path + extNameMap[outputFormat]
  }

  writeFileSync(path, source);
};
