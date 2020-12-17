import { Definition, DefinitionOrBoolean } from "typescript-json-schema";

export type FileContentMap = {
  [index: string]: string;
};

export type SchemaRenderer = (
  schema: Definition,
  name: string,
  menu: string
) => string;

export type RefDefinition = {
  [key: string]: DefinitionOrBoolean;
};

export type TypeDocData = {
  type: string | string[],
  name: string,
  subTypes: string[],
  example: string, 
  desc: string,
  children?: TypeDocData[]
}

/** 去掉所有 $ref 的 schema */
export type TypeDefWithNoRef = DefinitionOrBoolean