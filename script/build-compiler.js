const rollup = require("rollup");
const typescript = require("rollup-plugin-typescript2");
const filePath = require("./rollup-plugin-file-path");
const banner = require('rollup-plugin-license');
const chokidar = require("chokidar");
const chalk = require('chalk')

const env = process.env.NODE_ENV || "development";

const buildCompiler = async () => {
  const cliBundle = await rollup.rollup({
    input: "src/cli.ts",
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: { declaration: false },
        },
      }),
      /** 支持 import ejs 文件，获得文件路径 */
      filePath({
        include: ["**/*.ejs"],
      }),
      /** add excutable banner */
      banner({
        banner: {
          commentStyle: 'none',
          content: '#!/usr/bin/env node'
        }
      })
    ],
  });
  await cliBundle.write({
    format: "cjs",
    file: 'lib/doc4type/bin/doc4type',
    sourcemap: "inline",
  });

  const apiBundle = await rollup.rollup({
    input: "src/compiler/index.ts",
    plugins: [
      typescript(),
      filePath({
        include: ["**/*.ejs"],
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

  console.log(chalk.green("build success"));
};

buildCompiler();

if (env === "development") {
  chokidar.watch("src").on("change", () => {
    console.log(chalk.green("file change, rebuiding..."));
    buildCompiler();
  });

  console.log("start watch");
}
