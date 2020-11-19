/** node script/doc-by-type.js --file-path <type-export-file> --type-name <type-name or *> --file-root <optional-file-root> */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const TJS = require('typescript-json-schema');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { join } = require('path');
const { render } = require('mustache');
const tosource = require('tosource');

const { filePath, fileRoot, typeName, menu } = yargs(hideBin(process.argv)).argv;

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

const mdxTemplate = fs.readFileSync(join(__dirname, './mdx.mustache'), { encoding: 'utf8' });
const jsxTemplate = fs.readFileSync(join(__dirname, './jsx.mustache'), { encoding: 'utf8' });

Object.keys(schema.properties).forEach(async (name) => {
  const dirPath = join(__dirname, `../src/${docMenu}/${name}`);
  const mdxPath = `${dirPath}/doc.mdx`;
  const jsxPath = `${dirPath}/Component.jsx`;
  if (fs.existsSync(mdxPath) || fs.existsSync(jsxPath)) {
    return;
  }

  console.log('create doc on', dirPath);

  await mkdirp(dirPath);

  fs.writeFileSync(
    mdxPath,
    render(mdxTemplate, {
      name,
      menu: docMenu,
      typeDesc: JSON.stringify(schema.properties[name], null, 2),
    })
  );
  fs.writeFileSync(
    jsxPath,
    render(jsxTemplate, {
      propTypes: tosource({}),
    })
  );
});
