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

Object.keys(schema.properties).forEach(async (name) => {
  const dirPath = join(__dirname, `../docs/${docMenu}/${name}`);
  const mdxPath = `${dirPath}/doc.md`;
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
      typeDesc: JSON.stringify(schema.properties[name], null, 2),
    })
  );
});
