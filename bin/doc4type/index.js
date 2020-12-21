'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var yargs = require('yargs');
var lodash = require('lodash');
var path = require('path');
var TJS = require('typescript-json-schema');
var ejs = require('ejs');
var fs = require('fs');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var emoji = require('node-emoji');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var TJS__default = /*#__PURE__*/_interopDefaultLegacy(TJS);
var ejs__default = /*#__PURE__*/_interopDefaultLegacy(ejs);
var mkdirp__default = /*#__PURE__*/_interopDefaultLegacy(mkdirp);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var emoji__default = /*#__PURE__*/_interopDefaultLegacy(emoji);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * 将 {$ref: string} 这种引用类型转换为被引用的类型（非递归）
 * @param refTypeSpecObj 引用类型的对象
 * @param definitions 定义列表
 */
function findAndReplaceRefObj(refTypeSpecObj, definitions) {
    var _a;
    if (typeof refTypeSpecObj === "boolean") {
        return refTypeSpecObj;
    }
    const refPath = refTypeSpecObj.$ref;
    if (!refPath) {
        return refTypeSpecObj;
    }
    const refName = (_a = refPath.match(/^#\/definitions\/(.*)$/)) === null || _a === void 0 ? void 0 : _a[1];
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
function tranverseAndReplaceRefObj(propTypeSpec, definitions) {
    if (typeof propTypeSpec === "boolean") {
        return propTypeSpec;
    }
    if (propTypeSpec.$ref) {
        const ObjWithNoRef = tranverseAndReplaceRefObj(findAndReplaceRefObj(propTypeSpec, definitions), definitions);
        return ObjWithNoRef;
    }
    if (propTypeSpec.anyOf) {
        const typeList = propTypeSpec.anyOf;
        return {
            anyOf: typeList.map((child) => tranverseAndReplaceRefObj(child, definitions)),
        };
    }
    if (propTypeSpec.type === "object") {
        const objectTypeProp = Object.assign({}, propTypeSpec.properties);
        const properties = propTypeSpec.properties;
        if (properties) {
            Object.keys(properties).forEach((iPropName) => {
                const replacedObjSpec = findAndReplaceRefObj(properties[iPropName], definitions);
                objectTypeProp[iPropName] = tranverseAndReplaceRefObj(replacedObjSpec, definitions);
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
        }
        else {
            return {
                type: "array",
                items: arrayItems.map((itemType) => tranverseAndReplaceRefObj(itemType, definitions)),
            };
        }
    }
    return propTypeSpec;
}
function normalize(defOrBool) {
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
        const propsWithNoRef = {};
        Object.keys(properties).forEach((propKey) => {
            propsWithNoRef[propKey] = tranverseAndReplaceRefObj(properties[propKey], definitions);
        });
        defWithNoRef.properties = propsWithNoRef;
    }
    // 处理 array
    if (items !== undefined && items !== null) {
        if (typeof items === "boolean") {
            return defWithNoRef;
        }
        else if (Array.isArray(items)) {
            // TODO：支持元祖
            return defWithNoRef;
        }
        else if (items.properties) {
            const propsWithNoRef = {};
            const itemsprops = items.properties;
            Object.keys(itemsprops).forEach((propKey) => {
                propsWithNoRef[propKey] = tranverseAndReplaceRefObj(itemsprops[propKey], definitions);
            });
            items.properties = propsWithNoRef;
        }
    }
    return defWithNoRef;
}

function generateSchema(filePath, fileRoot, typeName) {
    const program = TJS__default['default'].getProgramFromFiles([filePath], {
        ignoreErrors: true,
    }, fileRoot);
    const schema = TJS__default['default'].generateSchema(program, typeName, {
        ignoreErrors: true,
    });
    if (!schema) {
        throw new Error("Cannot generate schema, find reason from previous error stack");
    }
    return schema;
}

const BOOL_TYPE = "unknown";
function getDocDataFromNormalized(schemaWithNoRef, typeName) {
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
        const subTypes = [];
        schemaWithNoRef.anyOf.forEach((unionType) => {
            if (typeof unionType === "boolean") {
                subTypes.push(BOOL_TYPE);
            }
            else if (unionType.type) {
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
            example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
            desc: description || "",
            children: schemaWithNoRef.anyOf.map((unionType) => getDocDataFromNormalized(unionType, unionType.type)),
        };
    }
    if (properties) {
        return {
            type: "object",
            subTypes: [],
            name: typeName || "",
            example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
            desc: description || "",
            children: Object.keys(properties).map((propKey) => getDocDataFromNormalized(properties[propKey], propKey)),
        };
    }
    if (items !== undefined) {
        if (typeof items === "boolean") {
            return {
                type: "array",
                name: typeName || "",
                example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
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
                example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
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
                example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
                desc: description || "",
                subTypes: [],
                children: [
                    {
                        type: items.type || "",
                        name: items.type || "",
                        example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
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
            example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
            desc: description || "",
            subTypes: [],
            children: Object.keys(properties).map((propKey) => getDocDataFromNormalized(properties[propKey], propKey)),
        };
    }
    return {
        type: schemaWithNoRef["type"] || "unknown",
        name: typeName || "",
        example: (examples === null || examples === void 0 ? void 0 : examples.toString()) || "",
        desc: description || "",
        subTypes: [],
        children: [],
    };
}

const renderByEjs = (data, templatePath, saveFilePath) => {
    const templateString = fs.readFileSync(templatePath, { encoding: "utf-8" });
    const renderedString = ejs__default['default'].render(templateString, data, {
        filename: templatePath,
    });
    const dirPath = path.dirname(saveFilePath);
    if (!fs.existsSync(dirPath)) {
        mkdirp__default['default'](dirPath).then(() => {
            fs.writeFileSync(saveFilePath, renderedString);
        });
    }
    else {
        fs.writeFileSync(saveFilePath, renderedString);
    }
};

const successLogger = (args) => {
    console.log(emoji__default['default'].find("😎").emoji, chalk__default['default'].green(`Generate type description doc for '${args.path}:${args.typeName}' in '${args.menu}/${args.typeName}.md'`));
};
const errorLogger = (error) => {
    console.error(chalk__default['default'].red(error.message), chalk__default['default'].red(error.stack || ""));
};

function doc4Type(option) {
    return __awaiter(this, void 0, void 0, function* () {
        const { path: path$1, root, typeName, menu, output } = option;
        const docPath = output || path.join(__dirname, "../../docs", menu || "", `${typeName}.md`);
        const templatePath = path.join(__dirname, "../../src/template/type-doc.ejs");
        const getTypeDocDataFromFile = lodash.flow([
            generateSchema,
            normalize,
            lodash.curryRight(getDocDataFromNormalized)((typeName || "MainType")),
            lodash.curryRight(renderByEjs)(templatePath, docPath),
        ]);
        try {
            getTypeDocDataFromFile(path$1, root, typeName);
            successLogger({
                path: path$1,
                root,
                typeName,
                menu: menu || ".",
            });
        }
        catch (error) {
            errorLogger(error);
        }
    });
}
function cliMain() {
    return __awaiter(this, void 0, void 0, function* () {
        const { path = "", root = "", typeName, menu, output } = yargs.option("path", {
            alias: "p",
            type: "string",
            demandOption: true,
        })
            .option("output", {
            alias: "o",
            type: "string",
        })
            .option("root", {
            alias: "r",
            type: "string",
        })
            .option("typeName", {
            alias: "t",
            type: "string",
            demandOption: true,
        })
            .option("menu", {
            alias: "m",
            type: "string",
        }).argv;
        doc4Type({
            path,
            root,
            typeName,
            menu,
            output,
        });
    });
}
cliMain();

exports.doc4Type = doc4Type;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21waWxlci9ub3JtYWxpemUudHMiLCIuLi8uLi9zcmMvY29tcGlsZXIvZ2VuZXJhdGVTY2hlbWEudHMiLCIuLi8uLi9zcmMvY29tcGlsZXIvZ2V0RG9jRGF0YS50cyIsIi4uLy4uL3NyYy9jb21waWxlci9yZW5kZXJlci50cyIsIi4uLy4uL3NyYy9jb21waWxlci9sb2dnZXIudHMiLCIuLi8uLi9zcmMvY29tcGlsZXIvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRKUyBmcm9tIFwidHlwZXNjcmlwdC1qc29uLXNjaGVtYVwiO1xuaW1wb3J0IHsgUmVmRGVmaW5pdGlvbiwgVHlwZURlZldpdGhOb1JlZiB9IGZyb20gXCIuL3R5cGVcIjtcblxuLyoqXG4gKiDlsIYgeyRyZWY6IHN0cmluZ30g6L+Z56eN5byV55So57G75Z6L6L2s5o2i5Li66KKr5byV55So55qE57G75Z6L77yI6Z2e6YCS5b2S77yJXG4gKiBAcGFyYW0gcmVmVHlwZVNwZWNPYmog5byV55So57G75Z6L55qE5a+56LGhXG4gKiBAcGFyYW0gZGVmaW5pdGlvbnMg5a6a5LmJ5YiX6KGoXG4gKi9cbmZ1bmN0aW9uIGZpbmRBbmRSZXBsYWNlUmVmT2JqKFxuICByZWZUeXBlU3BlY09iajogVEpTLkRlZmluaXRpb25PckJvb2xlYW4sXG4gIGRlZmluaXRpb25zOiBSZWZEZWZpbml0aW9uXG4pIHtcbiAgaWYgKHR5cGVvZiByZWZUeXBlU3BlY09iaiA9PT0gXCJib29sZWFuXCIpIHtcbiAgICByZXR1cm4gcmVmVHlwZVNwZWNPYmo7XG4gIH1cbiAgY29uc3QgcmVmUGF0aCA9IHJlZlR5cGVTcGVjT2JqLiRyZWY7XG4gIGlmICghcmVmUGF0aCkge1xuICAgIHJldHVybiByZWZUeXBlU3BlY09iajtcbiAgfVxuICBjb25zdCByZWZOYW1lID0gcmVmUGF0aC5tYXRjaCgvXiNcXC9kZWZpbml0aW9uc1xcLyguKikkLyk/LlsxXTtcblxuICBpZiAoIXJlZk5hbWUpIHtcbiAgICByZXR1cm4gcmVmVHlwZVNwZWNPYmo7XG4gIH1cblxuICBjb25zdCBkZWZPYmogPSBkZWZpbml0aW9uc1tyZWZOYW1lXSB8fCB7fTtcblxuICByZXR1cm4gZGVmT2JqO1xufVxuXG4vKipcbiAqIOWwhiB7JHJlZjogc3RyaW5nfSDov5nnp43lvJXnlKjnsbvlnovovazmjaLkuLrooqvlvJXnlKjnmoTnsbvlnovvvIjpgJLlvZLvvIlcbiAqIEBwYXJhbSByZWZUeXBlU3BlY09iaiDlvJXnlKjnsbvlnovnmoTlr7nosaFcbiAqIEBwYXJhbSBkZWZpbml0aW9ucyDlrprkuYnliJfooahcbiAqL1xuZnVuY3Rpb24gdHJhbnZlcnNlQW5kUmVwbGFjZVJlZk9iaihcbiAgcHJvcFR5cGVTcGVjOiBUSlMuRGVmaW5pdGlvbk9yQm9vbGVhbixcbiAgZGVmaW5pdGlvbnM6IFJlZkRlZmluaXRpb25cbik6IFRKUy5EZWZpbml0aW9uT3JCb29sZWFuIHtcbiAgaWYgKHR5cGVvZiBwcm9wVHlwZVNwZWMgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmV0dXJuIHByb3BUeXBlU3BlYztcbiAgfVxuXG4gIGlmIChwcm9wVHlwZVNwZWMuJHJlZikge1xuICAgIGNvbnN0IE9ialdpdGhOb1JlZiA9IHRyYW52ZXJzZUFuZFJlcGxhY2VSZWZPYmooXG4gICAgICBmaW5kQW5kUmVwbGFjZVJlZk9iaihwcm9wVHlwZVNwZWMsIGRlZmluaXRpb25zKSxcbiAgICAgIGRlZmluaXRpb25zXG4gICAgKTtcblxuICAgIHJldHVybiBPYmpXaXRoTm9SZWY7XG4gIH1cbiAgaWYgKHByb3BUeXBlU3BlYy5hbnlPZikge1xuICAgIGNvbnN0IHR5cGVMaXN0ID0gcHJvcFR5cGVTcGVjLmFueU9mO1xuICAgIHJldHVybiB7XG4gICAgICBhbnlPZjogdHlwZUxpc3QubWFwKChjaGlsZCkgPT5cbiAgICAgICAgdHJhbnZlcnNlQW5kUmVwbGFjZVJlZk9iaihjaGlsZCwgZGVmaW5pdGlvbnMpXG4gICAgICApLFxuICAgIH07XG4gIH1cbiAgaWYgKHByb3BUeXBlU3BlYy50eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgY29uc3Qgb2JqZWN0VHlwZVByb3AgPSB7IC4uLnByb3BUeXBlU3BlYy5wcm9wZXJ0aWVzIH07XG5cbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gcHJvcFR5cGVTcGVjLnByb3BlcnRpZXM7XG4gICAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICAgIE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLmZvckVhY2goKGlQcm9wTmFtZSkgPT4ge1xuICAgICAgICBjb25zdCByZXBsYWNlZE9ialNwZWMgPSBmaW5kQW5kUmVwbGFjZVJlZk9iaihcbiAgICAgICAgICBwcm9wZXJ0aWVzW2lQcm9wTmFtZV0sXG4gICAgICAgICAgZGVmaW5pdGlvbnNcbiAgICAgICAgKTtcbiAgICAgICAgb2JqZWN0VHlwZVByb3BbaVByb3BOYW1lXSA9IHRyYW52ZXJzZUFuZFJlcGxhY2VSZWZPYmooXG4gICAgICAgICAgcmVwbGFjZWRPYmpTcGVjLFxuICAgICAgICAgIGRlZmluaXRpb25zXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwib2JqZWN0XCIsIHByb3BlcnRpZXM6IG9iamVjdFR5cGVQcm9wIH07XG4gICAgfVxuICAgIC8vIOacieWPr+iDvee8uuWksSBwcm9wZXJ0aWVzIOeahOaDheWGte+8iOeUqOaIt+ebtOaOpeWumuS5iSB0eXBlIEEgPSBvYmplY3TvvIlcbiAgICByZXR1cm4geyB0eXBlOiBcIm9iamVjdFwiIH07XG4gIH1cbiAgaWYgKHByb3BUeXBlU3BlYy50eXBlID09PSBcImFycmF5XCIpIHtcbiAgICBjb25zdCBhcnJheUl0ZW1zID0gcHJvcFR5cGVTcGVjLml0ZW1zO1xuICAgIGlmICghYXJyYXlJdGVtcyB8fCB0eXBlb2YgYXJyYXlJdGVtcyA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgIHJldHVybiBwcm9wVHlwZVNwZWM7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShhcnJheUl0ZW1zKSkge1xuICAgICAgY29uc3QgaXRlbVR5cGUgPSBmaW5kQW5kUmVwbGFjZVJlZk9iaihhcnJheUl0ZW1zLCBkZWZpbml0aW9ucyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgIGl0ZW1zOiB0cmFudmVyc2VBbmRSZXBsYWNlUmVmT2JqKGl0ZW1UeXBlLCBkZWZpbml0aW9ucyksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgIGl0ZW1zOiBhcnJheUl0ZW1zLm1hcCgoaXRlbVR5cGUpID0+XG4gICAgICAgICAgdHJhbnZlcnNlQW5kUmVwbGFjZVJlZk9iaihpdGVtVHlwZSwgZGVmaW5pdGlvbnMpXG4gICAgICAgICksXG4gICAgICB9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gcHJvcFR5cGVTcGVjO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKFxuICBkZWZPckJvb2w6IFRKUy5EZWZpbml0aW9uT3JCb29sZWFuXG4pOiBUeXBlRGVmV2l0aE5vUmVmIHtcbiAgaWYgKHR5cGVvZiBkZWZPckJvb2wgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmV0dXJuIGRlZk9yQm9vbDtcbiAgfVxuICBcbiAgXG4gIGNvbnN0IHsgcHJvcGVydGllcywgaXRlbXMsIGRlZmluaXRpb25zLCBhbnlPZiB9ID0gZGVmT3JCb29sO1xuICBjb25zdCBkZWZXaXRoTm9SZWYgPSBkZWZPckJvb2w7XG5cbiAgaWYgKCFkZWZpbml0aW9ucykge1xuICAgIHJldHVybiBkZWZXaXRoTm9SZWY7XG4gIH1cblxuICAvLyDlpITnkIYgdW5pb25cbiAgaWYgKGFueU9mKSB7XG4gICAgZGVmV2l0aE5vUmVmLmFueU9mID0gYW55T2YubWFwKCh1bmlvbkl0ZW0pID0+IG5vcm1hbGl6ZSh1bmlvbkl0ZW0pKTtcbiAgfVxuXG4gIC8vIOWkhOeQhiBvYmplY3RcbiAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICBjb25zdCBwcm9wc1dpdGhOb1JlZjogeyBbaW5kZXg6IHN0cmluZ106IFRKUy5EZWZpbml0aW9uT3JCb29sZWFuIH0gPSB7fTtcbiAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wS2V5KSA9PiB7XG4gICAgICBwcm9wc1dpdGhOb1JlZltwcm9wS2V5XSA9IHRyYW52ZXJzZUFuZFJlcGxhY2VSZWZPYmooXG4gICAgICAgIHByb3BlcnRpZXNbcHJvcEtleV0sXG4gICAgICAgIGRlZmluaXRpb25zXG4gICAgICApO1xuICAgIH0pO1xuICAgIGRlZldpdGhOb1JlZi5wcm9wZXJ0aWVzID0gcHJvcHNXaXRoTm9SZWY7XG4gIH1cblxuICAvLyDlpITnkIYgYXJyYXlcbiAgaWYgKGl0ZW1zICE9PSB1bmRlZmluZWQgJiYgaXRlbXMgIT09IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIGl0ZW1zID09PSBcImJvb2xlYW5cIikge1xuICAgICAgcmV0dXJuIGRlZldpdGhOb1JlZjtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICAvLyBUT0RP77ya5pSv5oyB5YWD56WWXG4gICAgICByZXR1cm4gZGVmV2l0aE5vUmVmO1xuICAgIH0gZWxzZSBpZiAoaXRlbXMucHJvcGVydGllcykge1xuICAgICAgY29uc3QgcHJvcHNXaXRoTm9SZWY6IHsgW2luZGV4OiBzdHJpbmddOiBUSlMuRGVmaW5pdGlvbk9yQm9vbGVhbiB9ID0ge307XG5cbiAgICAgIGNvbnN0IGl0ZW1zcHJvcHMgPSBpdGVtcy5wcm9wZXJ0aWVzO1xuICAgICAgT2JqZWN0LmtleXMoaXRlbXNwcm9wcykuZm9yRWFjaCgocHJvcEtleSkgPT4ge1xuICAgICAgICBwcm9wc1dpdGhOb1JlZltwcm9wS2V5XSA9IHRyYW52ZXJzZUFuZFJlcGxhY2VSZWZPYmooXG4gICAgICAgICAgaXRlbXNwcm9wc1twcm9wS2V5XSxcbiAgICAgICAgICBkZWZpbml0aW9uc1xuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIGl0ZW1zLnByb3BlcnRpZXMgPSBwcm9wc1dpdGhOb1JlZjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVmV2l0aE5vUmVmO1xufVxuIiwiaW1wb3J0IFRKUyBmcm9tIFwidHlwZXNjcmlwdC1qc29uLXNjaGVtYVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTY2hlbWEoZmlsZVBhdGg6IHN0cmluZywgZmlsZVJvb3Q6IHN0cmluZywgdHlwZU5hbWU6IHN0cmluZykge1xuICBjb25zdCBwcm9ncmFtID0gVEpTLmdldFByb2dyYW1Gcm9tRmlsZXMoXG4gICAgW2ZpbGVQYXRoXSxcbiAgICB7XG4gICAgICBpZ25vcmVFcnJvcnM6IHRydWUsXG4gICAgfSxcbiAgICBmaWxlUm9vdFxuICApO1xuXG4gIGNvbnN0IHNjaGVtYSA9IFRKUy5nZW5lcmF0ZVNjaGVtYShwcm9ncmFtLCB0eXBlTmFtZSwge1xuICAgIGlnbm9yZUVycm9yczogdHJ1ZSxcbiAgfSk7XG5cbiAgaWYgKCFzY2hlbWEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkNhbm5vdCBnZW5lcmF0ZSBzY2hlbWEsIGZpbmQgcmVhc29uIGZyb20gcHJldmlvdXMgZXJyb3Igc3RhY2tcIlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gc2NoZW1hO1xufSIsImltcG9ydCB7IFR5cGVEb2NEYXRhLCBUeXBlRGVmV2l0aE5vUmVmIH0gZnJvbSBcIi4vdHlwZVwiO1xuXG5jb25zdCBCT09MX1RZUEUgPSBcInVua25vd25cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERvY0RhdGFGcm9tTm9ybWFsaXplZChcbiAgc2NoZW1hV2l0aE5vUmVmOiBUeXBlRGVmV2l0aE5vUmVmLFxuICB0eXBlTmFtZT86IHN0cmluZ1xuKTogVHlwZURvY0RhdGEge1xuICBpZiAodHlwZW9mIHNjaGVtYVdpdGhOb1JlZiA9PT0gXCJib29sZWFuXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogQk9PTF9UWVBFLFxuICAgICAgbmFtZTogXCJib29sZWFuXCIsXG4gICAgICBzdWJUeXBlczogW10sXG4gICAgICBleGFtcGxlOiBcIlwiLFxuICAgICAgZGVzYzogXCJcIixcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgeyBwcm9wZXJ0aWVzLCBpdGVtcywgZGVzY3JpcHRpb24sIGV4YW1wbGVzIH0gPSBzY2hlbWFXaXRoTm9SZWY7XG5cbiAgaWYgKHNjaGVtYVdpdGhOb1JlZi5hbnlPZikge1xuICAgIGNvbnN0IHN1YlR5cGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgc2NoZW1hV2l0aE5vUmVmLmFueU9mLmZvckVhY2goKHVuaW9uVHlwZSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB1bmlvblR5cGUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgIHN1YlR5cGVzLnB1c2goQk9PTF9UWVBFKTtcbiAgICAgIH0gZWxzZSBpZiAodW5pb25UeXBlLnR5cGUpIHtcbiAgICAgICAgY29uc3QgbmV3VHlwZXMgPSBBcnJheS5pc0FycmF5KHVuaW9uVHlwZS50eXBlKVxuICAgICAgICAgID8gdW5pb25UeXBlLnR5cGVcbiAgICAgICAgICA6IFt1bmlvblR5cGUudHlwZV07XG4gICAgICAgIHN1YlR5cGVzLnNwbGljZShzdWJUeXBlcy5sZW5ndGgsIDAsIC4uLm5ld1R5cGVzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcInVuaW9uXCIsXG4gICAgICBzdWJUeXBlcyxcbiAgICAgIG5hbWU6IHR5cGVOYW1lIHx8IFwiXCIsXG4gICAgICBleGFtcGxlOiBleGFtcGxlcz8udG9TdHJpbmcoKSB8fCBcIlwiLFxuICAgICAgZGVzYzogZGVzY3JpcHRpb24gfHwgXCJcIixcbiAgICAgIGNoaWxkcmVuOiBzY2hlbWFXaXRoTm9SZWYuYW55T2YubWFwKCh1bmlvblR5cGUpID0+XG4gICAgICAgIGdldERvY0RhdGFGcm9tTm9ybWFsaXplZCh1bmlvblR5cGUsICh1bmlvblR5cGUgYXMgYW55KS50eXBlKVxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIHN1YlR5cGVzOiBbXSxcbiAgICAgIG5hbWU6IHR5cGVOYW1lIHx8IFwiXCIsXG4gICAgICBleGFtcGxlOiBleGFtcGxlcz8udG9TdHJpbmcoKSB8fCBcIlwiLFxuICAgICAgZGVzYzogZGVzY3JpcHRpb24gfHwgXCJcIixcbiAgICAgIGNoaWxkcmVuOiBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5tYXAoKHByb3BLZXkpID0+XG4gICAgICAgIGdldERvY0RhdGFGcm9tTm9ybWFsaXplZChwcm9wZXJ0aWVzW3Byb3BLZXldLCBwcm9wS2V5KVxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgaWYgKGl0ZW1zICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIGl0ZW1zID09PSBcImJvb2xlYW5cIikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICBuYW1lOiB0eXBlTmFtZSB8fCBcIlwiLFxuICAgICAgICBleGFtcGxlOiBleGFtcGxlcz8udG9TdHJpbmcoKSB8fCBcIlwiLFxuICAgICAgICBkZXNjOiBkZXNjcmlwdGlvbiB8fCBcIlwiLFxuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIHN1YlR5cGVzOiBbXSxcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW1zKSkge1xuICAgICAgLy8gVE9ETyDmlK/mjIHlhYPnu4RcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgbmFtZTogdHlwZU5hbWUgfHwgXCJcIixcbiAgICAgICAgZXhhbXBsZTogZXhhbXBsZXM/LnRvU3RyaW5nKCkgfHwgXCJcIixcbiAgICAgICAgZGVzYzogZGVzY3JpcHRpb24gfHwgXCJcIixcbiAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICBzdWJUeXBlczogW10sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHsgcHJvcGVydGllcyB9ID0gaXRlbXM7XG4gICAgaWYgKCFwcm9wZXJ0aWVzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgIG5hbWU6IHR5cGVOYW1lIHx8IFwiXCIsXG4gICAgICAgIGV4YW1wbGU6IGV4YW1wbGVzPy50b1N0cmluZygpIHx8IFwiXCIsXG4gICAgICAgIGRlc2M6IGRlc2NyaXB0aW9uIHx8IFwiXCIsXG4gICAgICAgIHN1YlR5cGVzOiBbXSxcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBpdGVtcy50eXBlIHx8IFwiXCIsXG4gICAgICAgICAgICBuYW1lOiAoaXRlbXMudHlwZSBhcyBhbnkpIHx8IFwiXCIsXG4gICAgICAgICAgICBleGFtcGxlOiBleGFtcGxlcz8udG9TdHJpbmcoKSB8fCBcIlwiLFxuICAgICAgICAgICAgZGVzYzogZGVzY3JpcHRpb24gfHwgXCJcIixcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcbiAgICAgICAgICAgIHN1YlR5cGVzOiBbXSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgbmFtZTogdHlwZU5hbWUgfHwgXCJcIixcbiAgICAgIGV4YW1wbGU6IGV4YW1wbGVzPy50b1N0cmluZygpIHx8IFwiXCIsXG4gICAgICBkZXNjOiBkZXNjcmlwdGlvbiB8fCBcIlwiLFxuICAgICAgc3ViVHlwZXM6IFtdLFxuICAgICAgY2hpbGRyZW46IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLm1hcCgocHJvcEtleSkgPT5cbiAgICAgICAgZ2V0RG9jRGF0YUZyb21Ob3JtYWxpemVkKHByb3BlcnRpZXNbcHJvcEtleV0sIHByb3BLZXkpXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6IHNjaGVtYVdpdGhOb1JlZltcInR5cGVcIl0gfHwgXCJ1bmtub3duXCIsXG4gICAgbmFtZTogdHlwZU5hbWUgfHwgXCJcIixcbiAgICBleGFtcGxlOiBleGFtcGxlcz8udG9TdHJpbmcoKSB8fCBcIlwiLFxuICAgIGRlc2M6IGRlc2NyaXB0aW9uIHx8IFwiXCIsXG4gICAgc3ViVHlwZXM6IFtdLFxuICAgIGNoaWxkcmVuOiBbXSxcbiAgfTtcbn1cbiIsImltcG9ydCBlanMgZnJvbSBcImVqc1wiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCBta2RpcnAgZnJvbSBcIm1rZGlycFwiO1xuXG5leHBvcnQgY29uc3QgcmVuZGVyQnlFanMgPSAoXG4gIGRhdGE6IGFueSxcbiAgdGVtcGxhdGVQYXRoOiBzdHJpbmcsXG4gIHNhdmVGaWxlUGF0aDogc3RyaW5nXG4pID0+IHtcbiAgY29uc3QgdGVtcGxhdGVTdHJpbmcgPSByZWFkRmlsZVN5bmModGVtcGxhdGVQYXRoLCB7IGVuY29kaW5nOiBcInV0Zi04XCIgfSk7XG5cbiAgY29uc3QgcmVuZGVyZWRTdHJpbmcgPSBlanMucmVuZGVyKHRlbXBsYXRlU3RyaW5nLCBkYXRhLCB7XG4gICAgZmlsZW5hbWU6IHRlbXBsYXRlUGF0aCxcbiAgfSk7XG5cbiAgY29uc3QgZGlyUGF0aCA9IGRpcm5hbWUoc2F2ZUZpbGVQYXRoKTtcblxuICBpZiAoIWV4aXN0c1N5bmMoZGlyUGF0aCkpIHtcbiAgICBta2RpcnAoZGlyUGF0aCkudGhlbigoKT0+e1xuICAgICAgd3JpdGVGaWxlU3luYyhzYXZlRmlsZVBhdGgsIHJlbmRlcmVkU3RyaW5nKVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHdyaXRlRmlsZVN5bmMoc2F2ZUZpbGVQYXRoLCByZW5kZXJlZFN0cmluZyk7XG4gIH1cbn07XG4iLCJpbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCI7XG5pbXBvcnQgZW1vamkgZnJvbSBcIm5vZGUtZW1vamlcIjtcblxuZXhwb3J0IGNvbnN0IHN1Y2Nlc3NMb2dnZXIgPSAoYXJnczoge1xuICBwYXRoOiBzdHJpbmc7XG4gIHJvb3Q6IHN0cmluZztcbiAgdHlwZU5hbWU6IHN0cmluZztcbiAgbWVudTogc3RyaW5nO1xufSkgPT4ge1xuICBjb25zb2xlLmxvZyhcbiAgICBlbW9qaS5maW5kKFwi8J+YjlwiKS5lbW9qaSxcbiAgICBjaGFsay5ncmVlbihcbiAgICAgIGBHZW5lcmF0ZSB0eXBlIGRlc2NyaXB0aW9uIGRvYyBmb3IgJyR7YXJncy5wYXRofToke2FyZ3MudHlwZU5hbWV9JyBpbiAnJHthcmdzLm1lbnV9LyR7YXJncy50eXBlTmFtZX0ubWQnYFxuICAgIClcbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBlcnJvckxvZ2dlciA9IChlcnJvcjogRXJyb3IpID0+IHtcbiAgY29uc29sZS5lcnJvcihcbiAgICBjaGFsay5yZWQoZXJyb3IubWVzc2FnZSksXG4gICAgY2hhbGsucmVkKGVycm9yLnN0YWNrIHx8IFwiXCIpXG4gICk7XG59O1xuIiwiLyoqIG5vZGUgc2NyaXB0L2RvYy1ieS10eXBlLmpzIC0tcGF0aCA8dHlwZS1leHBvcnQtZmlsZT4gLS10eXBlLW5hbWUgPHR5cGUtbmFtZSBvciAqPiAtLXJvb3QgPG9wdGlvbmFsLWZpbGUtcm9vdD4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuaW1wb3J0IHsgZmxvdywgY3VycnlSaWdodCB9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgbm9ybWFsaXplIH0gZnJvbSBcIi4vbm9ybWFsaXplXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZVNjaGVtYSB9IGZyb20gXCIuL2dlbmVyYXRlU2NoZW1hXCI7XG5pbXBvcnQgeyBnZXREb2NEYXRhRnJvbU5vcm1hbGl6ZWQgfSBmcm9tIFwiLi9nZXREb2NEYXRhXCI7XG5pbXBvcnQgeyByZW5kZXJCeUVqcyB9IGZyb20gXCIuL3JlbmRlcmVyXCI7XG5pbXBvcnQgeyBzdWNjZXNzTG9nZ2VyLCBlcnJvckxvZ2dlciB9IGZyb20gXCIuL2xvZ2dlclwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG9jNFR5cGUob3B0aW9uOiB7XG4gIHBhdGg6IHN0cmluZztcbiAgcm9vdDogc3RyaW5nO1xuICB0eXBlTmFtZTogc3RyaW5nO1xuICBtZW51Pzogc3RyaW5nO1xuICBvdXRwdXQ/OiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IHsgcGF0aCwgcm9vdCwgdHlwZU5hbWUsIG1lbnUsIG91dHB1dCB9ID0gb3B0aW9uO1xuICBjb25zdCBkb2NQYXRoID1cbiAgICBvdXRwdXQgfHwgam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vZG9jc1wiLCBtZW51IHx8IFwiXCIsIGAke3R5cGVOYW1lfS5tZGApO1xuICBjb25zdCB0ZW1wbGF0ZVBhdGggPSBqb2luKF9fZGlybmFtZSwgXCIuLi8uLi9zcmMvdGVtcGxhdGUvdHlwZS1kb2MuZWpzXCIpO1xuXG4gIGNvbnN0IGdldFR5cGVEb2NEYXRhRnJvbUZpbGUgPSBmbG93KFtcbiAgICBnZW5lcmF0ZVNjaGVtYSxcbiAgICBub3JtYWxpemUsXG4gICAgY3VycnlSaWdodChnZXREb2NEYXRhRnJvbU5vcm1hbGl6ZWQpKCh0eXBlTmFtZSB8fCBcIk1haW5UeXBlXCIpIGFzIGFueSkgYXMgYW55LFxuICAgIGN1cnJ5UmlnaHQocmVuZGVyQnlFanMpKHRlbXBsYXRlUGF0aCwgZG9jUGF0aCksXG4gIF0pO1xuXG4gIHRyeSB7XG4gICAgZ2V0VHlwZURvY0RhdGFGcm9tRmlsZShwYXRoLCByb290LCB0eXBlTmFtZSk7XG4gICAgc3VjY2Vzc0xvZ2dlcih7XG4gICAgICBwYXRoLFxuICAgICAgcm9vdCxcbiAgICAgIHR5cGVOYW1lLFxuICAgICAgbWVudTogbWVudSB8fCBcIi5cIixcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlcnJvckxvZ2dlcihlcnJvcik7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY2xpTWFpbigpIHtcbiAgY29uc3QgeyBwYXRoID0gXCJcIiwgcm9vdCA9IFwiXCIsIHR5cGVOYW1lLCBtZW51LCBvdXRwdXQgfSA9IHlhcmdzXG4gICAgLm9wdGlvbihcInBhdGhcIiwge1xuICAgICAgYWxpYXM6IFwicFwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICB9KVxuICAgIC5vcHRpb24oXCJvdXRwdXRcIiwge1xuICAgICAgYWxpYXM6IFwib1wiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICB9KVxuICAgIC5vcHRpb24oXCJyb290XCIsIHtcbiAgICAgIGFsaWFzOiBcInJcIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgfSlcbiAgICAub3B0aW9uKFwidHlwZU5hbWVcIiwge1xuICAgICAgYWxpYXM6IFwidFwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICB9KVxuICAgIC5vcHRpb24oXCJtZW51XCIsIHtcbiAgICAgIGFsaWFzOiBcIm1cIixcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgfSkuYXJndjtcblxuICBkb2M0VHlwZSh7XG4gICAgcGF0aCxcbiAgICByb290LFxuICAgIHR5cGVOYW1lLFxuICAgIG1lbnUsXG4gICAgb3V0cHV0LFxuICB9KTtcbn1cblxuY2xpTWFpbigpO1xuIl0sIm5hbWVzIjpbIlRKUyIsInJlYWRGaWxlU3luYyIsImVqcyIsImRpcm5hbWUiLCJleGlzdHNTeW5jIiwibWtkaXJwIiwid3JpdGVGaWxlU3luYyIsImVtb2ppIiwiY2hhbGsiLCJwYXRoIiwiam9pbiIsImZsb3ciLCJjdXJyeVJpZ2h0IiwieWFyZ3NcclxuICAgICAg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
