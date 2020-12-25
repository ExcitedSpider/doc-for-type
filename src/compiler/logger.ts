import chalk from "chalk";
import emoji from "node-emoji";

export const successLogger = (args: {
  path: string;
  output?: string;
  typeName?: string;
}) => {
  const outputPath = args.output;

  console.log(
    emoji.find("😎").emoji,
    chalk.green(
      `Generate type description doc for ${args.path}:${args.typeName} as '${outputPath}'`
    )
  );
};

export const errorLogger = (error: Error) => {
  console.error(chalk.red(error.message), chalk.red(error.stack || ""));
};
