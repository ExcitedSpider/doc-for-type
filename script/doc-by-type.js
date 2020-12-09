/** node script/doc-by-type.js --file-path <type-export-file> --type-name <type-name or *> --file-root <optional-file-root> */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const TJS = require('typescript-json-schema');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { join, dirname } = require('path');
const { render } = require('mustache');
const ejs = require('ejs');

const GENERATE_ROOT_DIR = join(__dirname, '../docs/');

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（非递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function findAndReplaceRefObj(refTypeSpecObj, definitions) {
  if (!refTypeSpecObj.$ref) {
    return refTypeSpecObj;
  }
  const refPath = refTypeSpecObj.$ref;
  const refName = refPath.match(/^#\/definitions\/(.*)$/)[1];

  const defObj = definitions[refName] || {};

  return defObj;
}

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function tranverseAndReplaceRefObj(propTypeSpec, definitions) {
  if (propTypeSpec.$ref) {
    const ObjWithNoRef = tranverseAndReplaceRefObj(
      findAndReplaceRefObj(propTypeSpec, definitions),
      definitions
    );

    return ObjWithNoRef;
  }
  if (propTypeSpec.anyOf && Array.isArray(propTypeSpec.anyOf)) {
    return {
      anyOf: Object.keys(propTypeSpec.anyOf).map((childName) =>
        tranverseAndReplaceRefObj(propTypeSpec.anyOf[childName], definitions)
      ),
    };
  }
  if (propTypeSpec.type === 'object') {
    const objectTypeProp = { ...propTypeSpec.properties };

    if (propTypeSpec.properties) {
      Object.keys(propTypeSpec.properties).forEach((iPropName) => {
        const replacedObjSpec = findAndReplaceRefObj(
          propTypeSpec.properties[iPropName],
          definitions
        );
        objectTypeProp[iPropName] = tranverseAndReplaceRefObj(replacedObjSpec, definitions);
      });
      return { type: 'object', properties: objectTypeProp };
    }
    // 有可能缺失 properties 的情况（用户直接定义 type A = object）
    return { type: 'object' };
  }
  if (propTypeSpec.type === 'array') {
    const itemType = findAndReplaceRefObj(propTypeSpec.items, definitions);
    return { type: 'array', items: tranverseAndReplaceRefObj(itemType, definitions) };
  }
  return propTypeSpec;
}

/**
 * 将 schema 对象的 propName prop 构建为完整的对象（去除所有的 ref）
 * fieldName: 处理 schema 中的哪一个字段：默认 'properties'
 */
function buildProps(schema, propName, fieldName = 'properties') {
  return tranverseAndReplaceRefObj({ ...schema[fieldName][propName] }, schema.definitions);
}

/**
 * 构造出 schema 对应的文件-内容列表
 * @param {
 *  template: 用于构造内容的mustache模版
 *  render: 用于构造内容的渲染函数
 *  menu: 文件所在的目录
 *  schema: 内容 schema
 * } option
 * @returns 文件-内容表，例如{'dir/a.md': '#你好'}
 */
async function buildFileContentMap(option) {
  const { template, menu: optionMenu, schema, render: customRender } = option;

  const fileContentMap = {};

  function handleProperties(subSchema, menu = optionMenu) {
    Object.keys(subSchema.properties).forEach(async (name) => {
      const dirPath = join(GENERATE_ROOT_DIR, `/${menu}/${name}`);
      const mdxPath = `${dirPath}/doc.md`;

      if (!customRender) {
        fileContentMap[mdxPath] = render(template, {
          name,
          menu,
          // typeDesc: JSON.stringify(buildProps(subSchema, name), null, 2),
          typeDesc: buildProps(subSchema, name),
        });
      } else {
        fileContentMap[mdxPath] = customRender(subSchema, name, optionMenu);
      }
    });
  }

  function handleRecursiveUnion(schema, menu) {
    if (schema.anyOf) {
      schema.anyOf.forEach((subSchema, index) => {
        const indexMenu = `${menu}/${index}`;
        if (subSchema.anyOf) {
          handleRecursiveUnion(subSchema, indexMenu);
        } else if (subSchema.type === 'object' && subSchema.properties) {
          handleProperties(subSchema, indexMenu);
        }
      });
    } else if (schema.properties) {
      handleProperties(schema, menu);
    }
  }

  if (schema.anyOf) {
    const schemaWithNoRef = tranverseAndReplaceRefObj({ anyOf: schema.anyOf }, schema.definitions);
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
async function mapToFiles(fileContentMap) {
  Object.keys(fileContentMap).forEach(async (filePath) => {
    if (fs.existsSync(filePath)) {
      console.log('already exist doc on', filePath);
      return;
    }

    const dirPath = dirname(filePath);
    console.log('create new doc on', dirPath);
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

function generateSchema(filePath, fileRoot, typeName) {
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
  return schema;
}

async function main() {
  const { filePath, fileRoot, typeName, menu } = yargs(hideBin(process.argv)).argv;

  if (!filePath) {
    throw new Error(
      'Necessary arg filePath not provided! Use --file-path to specify the file that want to extract type from.'
    );
  }

  if (!typeName) {
    throw new Error(
      'Necessary arg typeName not provided! Use --type-name to specify the type name that want ot extract.'
    );
  }

  const docMenu = menu || typeName;

  const schema = generateSchema(filePath, fileRoot, typeName);

  const ejsTemplate = ejs.compile(
    fs.readFileSync(join(__dirname, '../src/template/md.ejs'), {
      encoding: 'utf8',
    })
  );

  const renderByEJS = (subSchema, name, menu) => {
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
