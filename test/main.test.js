const { doc4Type } = require("../bin/doc4type");
const { join } = require("path");

test("type-union", async () => {
  await doc4Type({
    path: join(__dirname, "./type-union/main.ts"),
    typeName: "MyObject",
    output: join(__dirname, "./type-union/schema.md"),
  });
});
