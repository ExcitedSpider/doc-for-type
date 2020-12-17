import TJS from "typescript-json-schema";

interface NormalizedTypeDesc {
  type: "array" | "object" | "string" | "number" | "boolean";
  props?: {
    [key: string]: TJS.Definition;
  };
  children?: NormalizedTypeDesc[];
}
function normalize(definitionOrBool: TJS.DefinitionOrBoolean) {
  if (typeof definitionOrBool === "boolean") {
    return {
      type: "boolean",
    };
  }

  if (definitionOrBool.type === "object" && definitionOrBool.properties) {
    return {
      type: "object",
    };
  }
}
