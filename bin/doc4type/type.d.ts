import { Definition, DefinitionOrBoolean } from "typescript-json-schema";
export declare type FileContentMap = {
    [index: string]: string;
};
export declare type SchemaRenderer = (schema: Definition, name: string, menu: string) => string;
export declare type RefDefinition = {
    [key: string]: DefinitionOrBoolean;
};
export declare type TypeDocData = {
    type: string | string[];
    name: string;
    subTypes: string[];
    example: string;
    desc: string;
    children?: TypeDocData[];
};
/** 去掉所有 $ref 的 schema */
export declare type TypeDefWithNoRef = DefinitionOrBoolean;
