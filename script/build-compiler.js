const rollup = require("rollup");
const typescript = require("rollup-plugin-typescript2");
const replace = require("@rollup/plugin-replace");
const filePath = require('./rollup-plugin-file-path')

const env = process.env.NODE_ENV || "development";

const buildCompiler = async () => {
  const cliBundle = await rollup.rollup({
    input: "src/compiler/index.ts",
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: { declaration: false },
        },
      }),
      replace({
        /** 编译结果：CLI 或是 API */
        "process.env.APP_TARGET": "'CLI'",
      }),
      /** 支持 import ejs 文件，获得文件路径 */
      filePath({
        include: ['**/*.ejs']
      }),
    ],
  });
  await cliBundle.write({
    dir: "lib/doc4type/bin",
    format: "cjs",
    sourcemap: "inline",
  });

  const apiBundle = await rollup.rollup({
    input: "src/compiler/index.ts",
    plugins: [
      typescript(),
      replace({
        "process.env.APP_TARGET": "'API'",
      }),
      filePath({
        include: ['**/*.ejs']
      }),
    ],
  });

  await apiBundle.write({
    dir: "lib/doc4type",
    format: "cjs",
    sourcemap: "inline",
  });
  await apiBundle.write({
    dir: "lib/doc4type",
    format: "esm",
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