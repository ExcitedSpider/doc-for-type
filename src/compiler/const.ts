import { OuputFormat } from "./type";

export const extNameMap = {
  [OuputFormat.markdown]: ".md",
  [OuputFormat.json]: ".json",
  [OuputFormat.html]: ".html",
};

export const supportFormat: { [index: string]: OuputFormat } = {
  markdown: OuputFormat.markdown,
  json: OuputFormat.json,
  md: OuputFormat.markdown,
  html: OuputFormat.html
};

export const annotationKeywords = ['link','public', 'example', 'title', 'fragment', 'min', 'max', 'format'];