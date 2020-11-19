/** node script/doc-by-type.js --file-path <type-export-file> --type-name <type-name or *> --file-root <optional-file-root> */
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const TJS = require('typescript-json-schema');

const { filePath, fileRoot, typeName } = yargs(hideBin(process.argv)).argv;

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

console.log(schema);
