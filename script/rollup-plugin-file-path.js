const { createFilter } = require("@rollup/pluginutils");
const { relative } = require("path");

const pathTemplate = (path) => `
  var path = ${path};
  export default path;
`;

module.exports = function filePath(
  options = {
    include: ["**/*.ejs"],
    exclude: null,
    relative: true,
  }
) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: "file-path",
    load(id) {
      if (!filter(id)) {
        return null;
      }

      if (relative) {
        const relativePath = relative(process.cwd(), id);
        return pathTemplate(JSON.stringify(relativePath));
      } else {
        return pathTemplate(JSON.stringify(id));
      }
    },
  };
};
