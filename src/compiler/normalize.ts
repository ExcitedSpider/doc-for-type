import TJS from "typescript-json-schema";
import { RefDefinition, DefinitionWithName } from "./type";

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（非递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function replaceRefObj(
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

  if (typeof defObj === "object") {
    return { ...defObj, name: refName };
  }
  return defObj;
}

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function tranverseAndReplaceRefObj(
  propTypeSpec: DefinitionWithName,
  definitions: RefDefinition,
  /** 已经查找过的 ref ，用于处理递归类型*/
  resolvedRef: { [index: string]: boolean } = {}
): DefinitionWithName {
  if (typeof propTypeSpec === "boolean") {
    return propTypeSpec;
  }

  if (propTypeSpec.$ref) {
    if (resolvedRef[propTypeSpec.$ref]) {
      // 监测到递归类型
      const refName = propTypeSpec.$ref.match(/^#\/definitions\/(.*)$/)?.[1];
      return {
        ...propTypeSpec,
        type: refName,
        link: `${refName}`
      }
    }

    const ObjWithNoRef = tranverseAndReplaceRefObj(
      replaceRefObj(propTypeSpec, definitions),
      definitions,
      {
        ...resolvedRef,
        [propTypeSpec.$ref]: true,
      }
    );

    return ObjWithNoRef;
  }
  if (propTypeSpec.anyOf || propTypeSpec.allOf) {
    const typeList = propTypeSpec.anyOf || propTypeSpec.allOf || [];
    return {
      ...propTypeSpec,
      [propTypeSpec.anyOf ? "anyOf" : "allOf"]: typeList.map((child) =>
        tranverseAndReplaceRefObj(child, definitions, { ...resolvedRef })
      ),
    };
  }
  if (propTypeSpec.type === "object") {
    const objectTypeProp = { ...propTypeSpec.properties };

    const properties = propTypeSpec.properties;
    if (properties) {
      Object.keys(properties).forEach((iPropName) => {
        const subProps = properties[iPropName];
        if (typeof subProps === "boolean") {
          return;
        }
        if (subProps.$ref) {
          const replacedObjSpec = replaceRefObj(subProps, definitions);
          objectTypeProp[iPropName] = tranverseAndReplaceRefObj(
            replacedObjSpec,
            definitions,
            { ...resolvedRef, [subProps.$ref]: true }
          );
        } else {
          objectTypeProp[iPropName] = tranverseAndReplaceRefObj(
            subProps,
            definitions,
            { ...resolvedRef }
          );
        }
      });
      return {
        ...propTypeSpec,
        type: "object",
        properties: objectTypeProp,
      };
    }
    // 有可能缺失 properties 的情况（用户直接定义 type A = object）
    return { ...propTypeSpec, type: "object" };
  }
  if (propTypeSpec.type === "array") {
    const arrayItems = propTypeSpec.items;
    if (!arrayItems || typeof arrayItems === "boolean") {
      return propTypeSpec;
    }
    if (!Array.isArray(arrayItems)) {
      let itemType: DefinitionWithName = arrayItems;
      if (arrayItems.$ref && !resolvedRef[arrayItems.$ref]) {
        itemType = replaceRefObj(arrayItems, definitions);
        return {
          ...propTypeSpec,
          type: "array",
          items: tranverseAndReplaceRefObj(itemType, definitions, {
            ...resolvedRef,
            [arrayItems.$ref]: true
          }),
        };
      }else{
        return {
          ...propTypeSpec,
          type: "array",
          items: tranverseAndReplaceRefObj(itemType, definitions, {
            ...resolvedRef,
          }),
        }
      }
    } else {
      return {
        ...propTypeSpec,
        type: "array",
        items: arrayItems.map((itemType) =>
          tranverseAndReplaceRefObj(itemType, definitions, { ...resolvedRef })
        ),
      };
    }
  }
  return propTypeSpec;
}

export function normalize(
  defOrBool: TJS.DefinitionOrBoolean
): DefinitionWithName {
  if (typeof defOrBool === "boolean") {
    return defOrBool;
  }

  const { properties, items, definitions, anyOf, $ref } = defOrBool;

  const defWithNoRef = $ref
    ? tranverseAndReplaceRefObj(defOrBool, defOrBool.definitions || {})
    : defOrBool;

  if (!definitions || typeof defWithNoRef === "boolean") {
    return defWithNoRef;
  }

  // 处理 union
  if (anyOf) {
    defWithNoRef.anyOf = anyOf.map((unionItem) =>
      tranverseAndReplaceRefObj(unionItem, definitions)
    );
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
