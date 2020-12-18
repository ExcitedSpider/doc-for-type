import chalk from "chalk";
import emoji from "node-emoji";

export const successLogger = (args: {
  path: string;
  root: string;
  typeName: string;
  menu: string;
}) => {
  console.log(
    emoji.find("✅").emoji,
    chalk.green(
      `Generate type description doc for '${args.path}:${args.typeName}' in '${args.menu}/${args.typeName}.md'`
    )
  );
};

export const errorLogger = (error: Error) => {
  console.error(
    chalk.red(error.message),
    chalk.red(error.stack || "")
  );
};
