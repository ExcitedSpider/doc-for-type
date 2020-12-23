import TJS from "typescript-json-schema";

const annotationKeywords = ['link','public', 'example'];

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
    validationKeywords: annotationKeywords,
    required: true
  });

  if (!schema) {
    throw new Error(
      "Cannot generate schema, find reason from previous error stack"
    );
  }

  return schema;
}