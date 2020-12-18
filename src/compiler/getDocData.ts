import { TypeDocData, TypeDefWithNoRef } from "./type";

const BOOL_TYPE = "unknown";

export function getDocDataFromNormalized(
  schemaWithNoRef: TypeDefWithNoRef,
  typeName?: string
): TypeDocData {
  if (typeof schemaWithNoRef === "boolean") {
    return {
      type: BOOL_TYPE,
      name: "boolean",
      subTypes: [],
      example: "",
      desc: "",
    };
  }

  const { properties, items, description, examples } = schemaWithNoRef;

  if (schemaWithNoRef.anyOf) {
    const subTypes: string[] = [];

    schemaWithNoRef.anyOf.forEach((unionType) => {
      if (typeof unionType === "boolean") {
        subTypes.push(BOOL_TYPE);
      } else if (unionType.type) {
        const newTypes = Array.isArray(unionType.type)
          ? unionType.type
          : [unionType.type];
        subTypes.splice(subTypes.length, 0, ...newTypes);
      }
    });

    return {
      type: "union",
      subTypes,
      name: typeName || "",
      example: examples?.toString() || "",
      desc: description || "",
      children: schemaWithNoRef.anyOf.map((unionType) =>
        getDocDataFromNormalized(unionType, (unionType as any).type)
      ),
    };
  }

  if (properties) {
    return {
      type: "object",
      subTypes: [],
      name: typeName || "",
      example: examples?.toString() || "",
      desc: description || "",
      children: Object.keys(properties).map((propKey) =>
        getDocDataFromNormalized(properties[propKey], propKey)
      ),
    };
  }

  if (items !== undefined) {
    if (typeof items === "boolean") {
      return {
        type: "array",
        name: typeName || "",
        example: examples?.toString() || "",
        desc: description || "",
        children: [],
        subTypes: [],
      };
    }
    if (Array.isArray(items)) {
      // TODO 支持元组
      return {
        type: "array",
        name: typeName || "",
        example: examples?.toString() || "",
        desc: description || "",
        children: [],
        subTypes: [],
      };
    }

    const { properties } = items;
    if (!properties) {
      return {
        type: "array",
        name: typeName || "",
        example: examples?.toString() || "",
        desc: description || "",
        subTypes: [],
        children: [
          {
            type: items.type || "",
            name: (items.type as any) || "",
            example: examples?.toString() || "",
            desc: description || "",
            children: [],
            subTypes: [],
          },
        ],
      };
    }

    return {
      type: "array",
      name: typeName || "",
      example: examples?.toString() || "",
      desc: description || "",
      subTypes: [],
      children: Object.keys(properties).map((propKey) =>
        getDocDataFromNormalized(properties[propKey], propKey)
      ),
    };
  }

  return {
    type: schemaWithNoRef["type"] || "unknown",
    name: typeName || "",
    example: examples?.toString() || "",
    desc: description || "",
    subTypes: [],
    children: [],
  };
}
