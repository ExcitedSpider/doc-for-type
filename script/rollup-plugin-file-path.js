const { createFilter } = require("@rollup/pluginutils");

const pathTemplate =(path)=> `
  var path = ${path};
  export default path;
`

module.exports = function filePath(
  options = {
    include: ["**/*.ejs"],
    exclude: null,
  }
) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: "file-path",
    load(id) {
      if (!filter(id)) {
        return null;
      }

      return pathTemplate(JSON.stringify(id));
    },
  };
}
