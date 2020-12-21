import TJS from "typescript-json-schema";
import { RefDefinition, TypeDefWithNoRef } from "./type";

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（非递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function findAndReplaceRefObj(
  refTypeSpecObj: TJS.DefinitionOrBoolean,
  definitions: RefDefinition
) {
  if (typeof refTypeSpecObj === "boolean") {
    return refTypeSpecObj;
  }
  const refPath = refTypeSpecObj.$ref;
  if (!refPath) {
    return refTypeSpecObj;
  }
  const refName = refPath.match(/^#\/definitions\/(.*)$/)?.[1];

  if (!refName) {
    return refTypeSpecObj;
  }

  const defObj = definitions[refName] || {};

  return defObj;
}

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function tranverseAndReplaceRefObj(
  propTypeSpec: TJS.DefinitionOrBoolean,
  definitions: RefDefinition
): TJS.DefinitionOrBoolean {
  if (typeof propTypeSpec === "boolean") {
    return propTypeSpec;
  }

  if (propTypeSpec.$ref) {
    const ObjWithNoRef = tranverseAndReplaceRefObj(
      findAndReplaceRefObj(propTypeSpec, definitions),
      definitions
    );

    return ObjWithNoRef;
  }
  if (propTypeSpec.anyOf || propTypeSpec.allOf) {
    const typeList = propTypeSpec.anyOf || propTypeSpec.allOf || [];
    return {
      [propTypeSpec.anyOf ? "anyOf" : "allOf"]: typeList.map((child) =>
        tranverseAndReplaceRefObj(child, definitions)
      ),
    };
  }
  if (propTypeSpec.type === "object") {
    const objectTypeProp = { ...propTypeSpec.properties };

    const properties = propTypeSpec.properties;
    if (properties) {
      Object.keys(properties).forEach((iPropName) => {
        const replacedObjSpec = findAndReplaceRefObj(
          properties[iPropName],
          definitions
        );
        objectTypeProp[iPropName] = tranverseAndReplaceRefObj(
          replacedObjSpec,
          definitions
        );
      });
      return { type: "object", properties: objectTypeProp };
    }
    // 有可能缺失 properties 的情况（用户直接定义 type A = object）
    return { type: "object" };
  }
  if (propTypeSpec.type === "array") {
    const arrayItems = propTypeSpec.items;
    if (!arrayItems || typeof arrayItems === "boolean") {
      return propTypeSpec;
    }
    if (!Array.isArray(arrayItems)) {
      const itemType = findAndReplaceRefObj(arrayItems, definitions);
      return {
        type: "array",
        items: tranverseAndReplaceRefObj(itemType, definitions),
      };
    } else {
      return {
        type: "array",
        items: arrayItems.map((itemType) =>
          tranverseAndReplaceRefObj(itemType, definitions)
        ),
      };
    }
  }
  return propTypeSpec;
}

export function normalize(
  defOrBool: TJS.DefinitionOrBoolean
): TypeDefWithNoRef {
  if (typeof defOrBool === "boolean") {
    return defOrBool;
  }

  const { properties, items, definitions, anyOf } = defOrBool;
  const defWithNoRef = defOrBool;

  if (!definitions) {
    return defWithNoRef;
  }

  // 处理 union
  if (anyOf) {
    defWithNoRef.anyOf = anyOf.map((unionItem) => normalize(unionItem));
  }

  // 处理 object
  if (properties) {
    const propsWithNoRef: { [index: string]: TJS.DefinitionOrBoolean } = {};
    Object.keys(properties).forEach((propKey) => {
      propsWithNoRef[propKey] = tranverseAndReplaceRefObj(
        properties[propKey],
        definitions
      );
    });
    defWithNoRef.properties = propsWithNoRef;
  }

  // 处理 array
  if (items !== undefined && items !== null) {
    if (typeof items === "boolean") {
      return defWithNoRef;
    } else if (Array.isArray(items)) {
      // TODO：支持元祖
      return defWithNoRef;
    } else if (items.properties) {
      const propsWithNoRef: { [index: string]: TJS.DefinitionOrBoolean } = {};

      const itemsprops = items.properties;
      Object.keys(itemsprops).forEach((propKey) => {
        propsWithNoRef[propKey] = tranverseAndReplaceRefObj(
          itemsprops[propKey],
          definitions
        );
      });

      items.properties = propsWithNoRef;
    }
  }

  return defWithNoRef;
}
