const { join } = require("path");
const { spawn } = require("child_process");
const { stdout, stderr } = require("process");

const CLI_PATH = join(__dirname, "../lib/cli.js");

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


/**
 * 测试一个文件夹下的 case
 * @param {*} dir 测试文件夹
 * @param {*} typename 提取的类型名称
 */
const spwanDoc4Type = async (dir, typename) => {
  return Promise.all([
    spwanStdIO(
      "node",
      [
        CLI_PATH,
        "--output",
        `${dir}/schema`,
        "--path",
        `${dir}/main.ts`,
        "--type-name",
        typename,
      ],
      {
        cwd: "../",
      }
    ),
    spwanStdIO(
      "node",
      [
        CLI_PATH,
        "--output",
        `${dir}/schema`,
        "--path",
        `${dir}/main.ts`,
        "--type-name",
        typename,
        "--format",
        "json",
      ],
      {
        cwd: "../",
      }
    ),
    spwanStdIO(
      "node",
      [
        CLI_PATH,
        "--output",
        `${dir}/schema`,
        "--path",
        `${dir}/main.ts`,
        "--type-name",
        typename,
        "--format",
        "html",
      ],
      {
        cwd: "../",
      }
    )
  ]);
};


test("complex-type", async () => {
  const testDir = join(__dirname, "./complex-type");
  await spwanDoc4Type(testDir, "IComplex");
});

test("type-union", async () => {
  const testDir = join(__dirname, "./type-union");
  await spwanDoc4Type(testDir, "MyObject");
});

test("type-intersection", async () => {
  const testDir = join(__dirname, "./type-intersection");
  await spwanDoc4Type(testDir, "MyObject");
});

test("import-type", async () => {
  const testDir = join(__dirname, "./import-type");
  await spwanDoc4Type(testDir, "MyObject");
});

test("type-union-tagged", async () => {
  const testDir = join(__dirname, "./type-union-tagged");
  await spwanDoc4Type(testDir, "Shape");
});

test("props-required", async () => {
  const testDir = join(__dirname, "./props-required");
  await spwanDoc4Type(testDir, "MyObject");
});

test("item-props-required", async () => {
  const testDir = join(__dirname, "./item-props-required");
  await spwanDoc4Type(testDir, "MyObject");
});

test("annotation-default", async () => {
  const testDir = join(__dirname, "./annotation-default");
  await spwanDoc4Type(testDir, "MyObject");
});

test("recursive-type", async () => {
  const testDir = join(__dirname, "./recursive-type");
  await spwanDoc4Type(testDir, "MyNode");
});

test("index-type", async () => {
  const testDir = join(__dirname, "./index-type");
  await spwanDoc4Type(testDir, "MyObject");
});
