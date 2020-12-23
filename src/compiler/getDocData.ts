import { defaults, omit } from "lodash";
import { TypeDocData, TypeDefWithNoRef } from "./type";

const BOOL_TYPE = "unknown";

const defaultData = {
  type: "unknown",
  name: "unknown",
  subTypes: [],
  example: "",
  link: "",
  quote: "",
  desc: "",
  children: [],
  isRequired: false,
  required: [],
};

function mergeRequiredIntoChildren(
  required: string[],
  children: TypeDocData[]
) {
  if (required.length === 0 || children.length === 0) {
    return children;
  }
  const mergedChildren = children.slice();
  /** TODO: n^2 查找，需要验证是否需要优化 */
  required.forEach((field) => {
    const child = mergedChildren.find((child) => child.name === field);
    if (child) {
      child.isRequired = true;
    }
  });

  return mergedChildren;
}

export function getDocDataFromNormalized(
  schemaWithNoRef: TypeDefWithNoRef,
  typeName: string
): TypeDocData {
  if (typeof schemaWithNoRef === "boolean") {
    return {
      type: BOOL_TYPE,
      name: "boolean",
      subTypes: [],
      example: "",
      link: "",
      quote: "",
      desc: "",
    };
  }

  const { properties, items, description, required } = schemaWithNoRef;

  const extraInfo = omit(schemaWithNoRef, [
    "anyOf",
    "allOf",
    "name",
    "type",
    "definitions",
    "properties",
  ]);

  if (schemaWithNoRef.anyOf || schemaWithNoRef.allOf) {
    const subTypes: string[] = [];

    const typeList = schemaWithNoRef.anyOf || schemaWithNoRef.allOf || [];

    typeList.forEach((unionType) => {
      if (typeof unionType === "boolean") {
        subTypes.push(BOOL_TYPE);
      } else if (unionType.type) {
        const newTypes = Array.isArray(unionType.type)
          ? unionType.type
          : /** 如果非匿名类型，则优先显示名称 */
            [
              (unionType as any).name
                ? (unionType as any).name
                : unionType.type,
            ];
        subTypes.splice(subTypes.length, 0, ...newTypes);
      }
    });

    return defaults(
      {
        ...extraInfo,
        type: schemaWithNoRef.anyOf ? "union" : "intersection",
        subTypes,
        name: typeName,
        desc: description,
        children: typeList.map((unionType) =>
          getDocDataFromNormalized(
            unionType,
            (unionType as any).name || (unionType as any).type
          )
        ),
      },
      defaultData
    );
  }

  if (properties) {
    return defaults(
      {
        ...extraInfo,
        type: "object",
        name: typeName,
        desc: description,
        children: mergeRequiredIntoChildren(
          required || [],
          Object.keys(properties).map((propKey) =>
            getDocDataFromNormalized(
              properties[propKey],
              (properties[propKey] as any)?.name || propKey
            )
          )
        ),
      },
      defaultData
    );
  }

  if (items !== undefined) {
    if (typeof items === "boolean") {
      return defaults(
        {
          ...extraInfo,
          type: "array",
          name: typeName,
          desc: description,
        },
        defaultData
      );
    }
    if (Array.isArray(items)) {
      // TODO 支持元组
      return defaults(
        {
          ...extraInfo,
          type: "array",
          name: typeName,
          desc: description,
        },
        defaultData
      );
    }

    const { properties, type, required } = items;
    if (!properties) {
      return defaults(
        {
          ...extraInfo,
          // 简单类型
          type: `${type}[]`,
          name: typeName,
          desc: description,
        },
        defaultData
      );
    }

    return defaults(
      {
        ...extraInfo,
        type: `${type}[]`,
        name: typeName,
        desc: description,
        children: mergeRequiredIntoChildren(
          required || [],
          Object.keys(properties).map((propKey) =>
            getDocDataFromNormalized(
              properties[propKey],
              (properties[propKey] as any)?.name || propKey
            )
          )
        ),
      },
      defaultData
    );
  }

  return defaults(
    {
      ...extraInfo,
      type: schemaWithNoRef["type"],
      name: typeName,
      desc: description,
    },
    defaultData
  );
}
