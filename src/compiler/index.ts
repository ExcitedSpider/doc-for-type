/** node script/doc-by-type.js --path <type-export-file> --type-name <type-name or *> --root <optional-file-root> */
import * as yargs from "yargs";
import TJS from "typescript-json-schema";
import fs from "fs";
import mkdirp from "mkdirp";
import { join, dirname } from "path";
import ejs from "ejs";
import { FileContentMap, SchemaRenderer, RefDefinition } from "./type";

const GENERATE_ROOT_DIR = join(__dirname, "../docs/");

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（非递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function findAndReplaceRefObj(
  refTypeSpecObj: TJS.DefinitionOrBoolean,
  definitions: RefDefinition
) {
  if (typeof refTypeSpecObj === "boolean") {
    return refTypeSpecObj;
  }
  const refPath = refTypeSpecObj.$ref;
  if (!refPath) {
    return refTypeSpecObj;
  }
  const refName = refPath.match(/^#\/definitions\/(.*)$/)?.[1];

  if (!refName) {
    return refTypeSpecObj;
  }

  const defObj = definitions[refName] || {};

  return defObj;
}

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function tranverseAndReplaceRefObj(
  propTypeSpec: TJS.DefinitionOrBoolean,
  definitions: RefDefinition
): TJS.DefinitionOrBoolean {
  if (typeof propTypeSpec === "boolean") {
    return propTypeSpec;
  }

  if (propTypeSpec.$ref) {
    const ObjWithNoRef = tranverseAndReplaceRefObj(
      findAndReplaceRefObj(propTypeSpec, definitions),
      definitions
    );

    return ObjWithNoRef;
  }
  if (propTypeSpec.anyOf) {
    const typeList = propTypeSpec.anyOf;
    return {
      anyOf: typeList.map((child) =>
        tranverseAndReplaceRefObj(child, definitions)
      ),
    };
  }
  if (propTypeSpec.type === "object") {
    const objectTypeProp = { ...propTypeSpec.properties };

    const properties = propTypeSpec.properties;
    if (properties) {
      Object.keys(properties).forEach((iPropName) => {
        const replacedObjSpec = findAndReplaceRefObj(
          properties[iPropName],
          definitions
        );
        objectTypeProp[iPropName] = tranverseAndReplaceRefObj(
          replacedObjSpec,
          definitions
        );
      });
      return { type: "object", properties: objectTypeProp };
    }
    // 有可能缺失 properties 的情况（用户直接定义 type A = object）
    return { type: "object" };
  }
  if (propTypeSpec.type === "array") {
    const arrayItems = propTypeSpec.items;
    if (!arrayItems || typeof arrayItems === "boolean") {
      return propTypeSpec;
    }
    if (!Array.isArray(arrayItems)) {
      const itemType = findAndReplaceRefObj(arrayItems, definitions);
      return {
        type: "array",
        items: tranverseAndReplaceRefObj(itemType, definitions),
      };
    } else {
      return {
        type: "array",
        items: arrayItems.map((itemType) =>
          tranverseAndReplaceRefObj(itemType, definitions)
        ),
      };
    }
  }
  return propTypeSpec;
}

/**
 * 将 schema 对象的 propName prop 构建为完整的对象（去除所有的 ref）
 * fieldName: 处理 schema 中的哪一个字段：默认 'properties'
 */
function buildProps(schema: TJS.DefinitionOrBoolean, propName: string) {
  if (typeof schema === "boolean" || typeof schema === "string") {
    return schema;
  }
  if (!schema.definitions || !schema.properties) {
    return schema.properties || {};
  }

  const propDef = schema.properties[propName];
  if (!propDef || typeof propDef === "boolean") {
    return propDef || {};
  }
  return tranverseAndReplaceRefObj({ ...propDef }, schema.definitions);
}

/**
 * 构造出 schema 对应的文件-内容列表
 * @returns {FileContentMap} fileContentMap 文件-内容表，例如`{'dir/a.md': '#你好'}`
 */
async function buildFileContentMap(option: {
  render: SchemaRenderer;
  menu: string;
  schema: TJS.DefinitionOrBoolean;
}) {
  const { menu: optionMenu, schema, render: customRender } = option;

  const fileContentMap: FileContentMap = {};

  function handleProperties(subSchema: TJS.Definition, menu = optionMenu) {
    if (!subSchema || !subSchema.properties) {
      const mdxPath = `${menu}/doc.md`;
      fileContentMap[mdxPath] = subSchema;
      return;
    }
    Object.keys(subSchema.properties).forEach(async (name) => {
      const dirPath = join(GENERATE_ROOT_DIR, `/${menu}/${name}`);
      const mdxPath = `${dirPath}/doc.md`;

      fileContentMap[mdxPath] = customRender(subSchema, name, optionMenu);
    });
  }

  function handleRecursiveUnion(schema: TJS.Definition, menu: string) {
    if (schema.anyOf) {
      schema.anyOf.forEach((subSchema, index) => {
        const indexMenu = `${menu}/${index}`;
        if (subSchema.anyOf) {
          handleRecursiveUnion(subSchema, indexMenu);
        } else if (subSchema.type === "object" && subSchema.properties) {
          handleProperties(subSchema, indexMenu);
        }
      });
    } else if (schema.properties) {
      handleProperties(schema, menu);
    }
  }

  if (schema.anyOf) {
    const schemaWithNoRef = tranverseAndReplaceRefObj(
      { anyOf: schema.anyOf },
      schema.definitions
    );
    handleRecursiveUnion(schemaWithNoRef, optionMenu);
  } else {
    handleProperties(schema);
  }

  return fileContentMap;
}

/**
 * 将文件内容表写到文件系统上
 * @param fileContentMap 文件-内容Map，例如{'dir/a.md': '#你好'}
 */
async function mapToFiles(fileContentMap: FileContentMap) {
  Object.keys(fileContentMap).forEach(async (filePath) => {
    if (fs.existsSync(filePath)) {
      console.log("already exist doc on", filePath);
      return;
    }

    const dirPath = dirname(filePath);
    console.log("create new doc on", dirPath);
    await mkdirp(dirPath);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, fileContentMap[filePath], (error) => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  });
}

function generateSchema(filePath: string, fileRoot: string, typeName: string) {
  const program = TJS.getProgramFromFiles(
    [filePath],
    {
      ignoreErrors: true,
    },
    fileRoot
  );

  const schema = TJS.generateSchema(program, typeName, {
    ignoreErrors: true,
  });

  if (!schema) {
    throw new Error(
      "Cannot generate schema, find reason from previous error stack"
    );
  }
  return schema;
}

async function main() {
  const { path: filePath = "", root: fileRoot = "", typeName, menu } = yargs
    .option("path", {
      alias: "p",
      type: "string",
      demandOption: true,
    })
    .option("root", {
      alias: "r",
      type: "string",
    })
    .option("typeName", {
      alias: "t",
      type: "string",
      demandOption: true,
    })
    .option("menu", {
      alias: "m",
      type: "string",
    }).argv;

  const docMenu = menu || typeName;

  const schema = generateSchema(filePath, fileRoot, typeName);

  const ejsTemplate = ejs.compile(
    fs.readFileSync(join(__dirname, "../src/template/md.ejs"), {
      encoding: "utf8",
    })
  );

  const renderByEJS = (
    subSchema: TJS.DefinitionOrBoolean,
    name: string,
    menu: string
  ) => {
    return ejsTemplate({
      name,
      menu,
      typeDesc: buildProps(subSchema, name),
    });
  };

  const fileContentMap = await buildFileContentMap({
    render: renderByEJS,
    menu: docMenu,
    schema,
  });

  await mapToFiles(fileContentMap);
}

main();
