import { OuputFormat } from "./type";

export const extName = {
  [OuputFormat.markdown]: ".md",
  [OuputFormat.json]: ".json",
};

export const supportFormat: { [index: string]: OuputFormat } = {
  markdown: OuputFormat.markdown,
  json: OuputFormat.json,
  md: OuputFormat.markdown,
};
