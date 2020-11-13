const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const TJS = require("typescript-json-schema");

const { typeRoot, typeDesc } = yargs(hideBin(process.argv)).argv;
