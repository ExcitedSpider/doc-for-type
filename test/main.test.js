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
      stderr.write(data);
      rej(data);
    });

    cp.on("close", (code) => {
      res(code);
    });
  });
};

const spwanDoc4Type = async (dir, typename) => {
  await spwanStdIO(
    "node",
    [
      CLI_PATH,
      "--output",
      `${dir}/schema.md`,
      "--path",
      `${dir}/main.ts`,
      "--type-name",
      typename,
    ],
    {
      cwd: "../",
    }
  );
};

const CLI_PATH = join(__dirname, "../lib/doc4type/bin");

test("type-union", async () => {
  const testDir = join(__dirname, "./type-union");
  await spwanDoc4Type(testDir, 'MyObject')
});

test("complex-type", async () => {
  const testDir = join(__dirname, "./complex-type");
  await spwanDoc4Type(testDir, 'IComplex')
});
