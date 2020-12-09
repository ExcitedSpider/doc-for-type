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
