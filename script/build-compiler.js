const rollup = require("rollup");
const typescript = require("rollup-plugin-typescript2");

const env = process.env.NODE_ENV || "development";

const buildCompiler = async () => {
  const bundle = await rollup.rollup({
    input: "src/compiler/index.ts",
    plugins: [typescript()],
  });

  await bundle.write({
    dir: "bin/doc4type",
    format: "cjs",
    sourcemap: "inline",
  });

  console.log("build success for bin/doc-by-type.js");
};

buildCompiler();

if (env === "development") {
  rollup
    .watch({
      input: [
        "src/compiler/index.ts",
        "src/compiler/renderer.ts",
        "src/compiler/generateSchema.ts",
        "src/compiler/getDocData.ts",
      ],
      watch: {
        include: "src/**",
      },
    })
    .addListener("change", async () => {
      await buildCompiler();
    });

  console.log("start watch");
}
