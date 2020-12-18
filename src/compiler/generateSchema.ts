import TJS from "typescript-json-schema";

export function generateSchema(filePath: string, fileRoot: string, typeName: string) {
  const program = TJS.getProgramFromFiles(
    [filePath],
    {
      ignoreErrors: true,
    },
    fileRoot
  );

  const schema = TJS.generateSchema(program, typeName, {
    ignoreErrors: true,
  });

  if (!schema) {
    throw new Error(
      "Cannot generate schema, find reason from previous error stack"
    );
  }

  console.log(JSON.stringify(schema, null, 2))
  return schema;
}