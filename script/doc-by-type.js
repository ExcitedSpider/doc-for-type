/** node script/doc-by-type.js --file-path <type-export-file> --type-name <type-name or *> --file-root <optional-file-root> */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const TJS = require('typescript-json-schema');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { join } = require('path');
const { render } = require('mustache');

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
Object.keys(schema.properties).forEach(async (name) => {
  // getTypeDesc(filePath, name);
  const dirPath = join(__dirname, `../docs/${docMenu}/${name}`);
  const mdxPath = `${dirPath}/doc.md`;
  console.log('doc-by-type:86', JSON.stringify(buildProps(schema, name)));
  if (fs.existsSync(mdxPath)) {
    console.log('already exist doc on', dirPath);
    return;
  }
  console.log('create new doc on', dirPath);

  await mkdirp(dirPath);

  fs.writeFileSync(
    mdxPath,
    render(mdTemplate, {
      name,
      menu: docMenu,
      typeDesc: JSON.stringify(buildProps(schema, name), null, 2),
    })
  );
});
