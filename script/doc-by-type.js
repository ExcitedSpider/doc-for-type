/** node script/doc-by-type.js --file-path <type-export-file> --type-name <type-name or *> --file-root <optional-file-root> */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const TJS = require('typescript-json-schema');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { join, dirname } = require('path');
const { render } = require('mustache');

const GENERATE_ROOT_DIR = join(__dirname, '../docs/');

/** 将 schema 对象的 propName prop 构建为完整的对象（去除所有的 ref） */
function buildProps(schema, propName) {
  function findAndReplaceRefObj(refTypeSpecObj) {
    if (!refTypeSpecObj.$ref) {
      return refTypeSpecObj;
    }
    const refPath = refTypeSpecObj.$ref;
    const refName = refPath.match(/^#\/definitions\/(.*)$/)[1];

    const defObj = schema.definitions[refName] || {};

    return defObj;
  }

  function tranverseType(propTypeSpec) {
    if (propTypeSpec.$ref) {
      const ObjWithNoRef = tranverseType(findAndReplaceRefObj(propTypeSpec));

      return ObjWithNoRef;
    }
    if (propTypeSpec.anyOf && Array.isArray(propTypeSpec.anyOf)) {
      return {
        anyOf: Object.keys(propTypeSpec.anyOf).map((childName) =>
          tranverseType(propTypeSpec.anyOf[childName])
        ),
      };
    }
    if (propTypeSpec.type === 'object') {
      const objectTypeProp = { ...propTypeSpec.properties };

      Object.keys(propTypeSpec.properties).forEach((iPropName) => {
        const replacedObjSpec = findAndReplaceRefObj(propTypeSpec.properties[iPropName]);
        objectTypeProp[iPropName] = tranverseType(replacedObjSpec);
      });
      return { type: 'object', properties: objectTypeProp };
    }
    if (propTypeSpec.type === 'array') {
      const itemType = findAndReplaceRefObj(propTypeSpec.items);
      return { type: 'array', items: tranverseType(itemType) };
    }
    return propTypeSpec;
  }

  return tranverseType({ ...schema.properties[propName] });
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

  Object.keys(schema.properties).forEach(async (name) => {
    const dirPath = join(GENERATE_ROOT_DIR, `/${optionMenu}/${name}`);
    const mdxPath = `${dirPath}/doc.md`;

    if (!customRender) {
      fileContentMap[mdxPath] = render(template, {
        name,
        menu: optionMenu,
        typeDesc: JSON.stringify(buildProps(schema, name), null, 2),
      });
    } else {
      fileContentMap[mdxPath] = customRender(schema, name, optionMenu);
    }
  });

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

  const mdTemplate = fs.readFileSync(join(__dirname, '../src/template/md.mustache'), {
    encoding: 'utf8',
  });

  const fileContentMap = await buildFileContentMap({
    template: mdTemplate,
    menu: docMenu,
    schema,
  });

  await mapToFiles(fileContentMap);
}

main();
