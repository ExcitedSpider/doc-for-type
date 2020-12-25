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

/** 生成文档的 raw json */
export type TypeDocData = {
  type: string | string[];
  title?:string,
  name: string;
  subTypes: string[];
  example: string;
  link: string;
  desc: string;
  children?: TypeDocData[];
  isRequired?: boolean;
  defaultValue?: string | null;
};

export type DefinitionWithName =
  | (Definition & { name?: string; link?: string; quote?: string })
  | boolean;
/** 去掉所有 $ref 的 schema */
export type TypeDefWithNoRef = DefinitionWithName;

export enum OuputFormat {
  'markdown', 'json', 'html'
}

/** 
 * @title API 文档
 * @description doc-for-type 的调用参数 
 * @example
 * const option:APIOption = {
 *  input: join(__dirname, "./type.ts"),
 *  typeName: "MyObject",
 *  format: 'markdown',
 * }
 * 
 * doc4Type(option);
 */
export interface APIOption {
  /** 输入的类型文件路径 */
  input: string;
  /** 需要生成文档的类型名称 */
  typeName: string;
  /** 项目根目录，一般情况下不需要使用 */
  root?: string;
  /** 
   * 输出的文档路径，默认在输入文件的同目录下
   * @default `${dirname(input)}\${typeName}.md`
   */
  output?: string;
  /** 
   * 生成的文档类型
   * @default 'markdown'
   */
  format?: OuputFormat | 'markdown'| 'md' | 'json' | 'html';
  /** 
   * 生成的文档 title。默认使用类型名称
   * @default typeName
   */
  title?: string
}