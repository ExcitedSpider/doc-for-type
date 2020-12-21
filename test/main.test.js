const { join } = require("path");
const { spawn } = require("child_process");
const { stdout, stderr } = require("process");

const spwanStdIO = (...spwanArgs) => {
  return new Promise((res, rej) => {
    const cp = spawn(...spwanArgs);

    cp.stdout.on("data", (data) => {
      stdout.write(data);
    });

    cp.stderr.on("data", (data) => {
      stderr.write(data)
      rej(data);
    });

    cp.on("close", (code) => {
      res(code);
    });
  });
};

const CLI_PATH = join(__dirname, "../lib/doc4type/bin");

test("type-union", async () => {
  const testDir = join(__dirname, "./type-union");
  await spwanStdIO(
    "node",
    [
      CLI_PATH,
      "--output",
      `${testDir}/schema.md`,
      "--path",
      `${testDir}/main.ts`,
      "--type-name",
      "MyObject",
    ],
    {
      cwd: "../",
    }
  );
});
