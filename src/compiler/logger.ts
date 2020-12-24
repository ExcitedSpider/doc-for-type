import chalk from "chalk";
import emoji from "node-emoji";
import { OuputFormat } from "./type";
import { extNameMap } from "./const";

export const successLogger = (args: {
  path: string;
  output?: string;
  format?: OuputFormat;
  root?: string;
  typeName?: string;
}) => {
  const outputPath = args.output;

  args.output ||
    console.log(
      emoji.find("😎").emoji,
      chalk.green(
        `Generate type description doc for '${args.path}:${args.typeName}' in '${outputPath}'`
      )
    );
};

export const errorLogger = (error: Error) => {
  console.error(chalk.red(error.message), chalk.red(error.stack || ""));
};
