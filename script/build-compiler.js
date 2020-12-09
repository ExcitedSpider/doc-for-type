const rollup = require("rollup");
const typescript = require("@rollup/plugin-typescript");

const buildCompiler = async () => {
  const bundle = await rollup.rollup({
    input: "src/compiler/index.ts",
    plugins: [typescript()],
  });

  bundle.write({
    dir: "bin",
    format: "cjs",
  });
};

buildCompiler()