'use strict';

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
    console.log(JSON.stringify(schema, null, 2));
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

function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const { path: filePath = "", root: fileRoot = "", typeName, menu } = yargs.option("path", {
            alias: "p",
            type: "string",
            demandOption: true,
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
        const docPath = path.join(__dirname, "../docs", menu || "", `${typeName}.md`);
        const templatePath = path.join(__dirname, "../src/template/type-doc.ejs");
        const getTypeDocDataFromFile = lodash.flow([
            generateSchema,
            normalize,
            lodash.curryRight(getDocDataFromNormalized)(typeName || "MainType"),
            lodash.curryRight(renderByEjs)(templatePath, docPath),
        ]);
        try {
            getTypeDocDataFromFile(filePath, fileRoot, typeName);
            successLogger({
                path: filePath,
                root: fileRoot,
                typeName,
                menu: menu || '.',
            });
        }
        catch (error) {
            errorLogger(error);
        }
    });
}
main();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jLWJ5LXR5cGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCIuLi9zcmMvY29tcGlsZXIvbm9ybWFsaXplLnRzIiwiLi4vc3JjL2NvbXBpbGVyL2dlbmVyYXRlU2NoZW1hLnRzIiwiLi4vc3JjL2NvbXBpbGVyL2dldERvY0RhdGEudHMiLCIuLi9zcmMvY29tcGlsZXIvcmVuZGVyZXIudHMiLCIuLi9zcmMvY29tcGlsZXIvbG9nZ2VyLnRzIiwiLi4vc3JjL2NvbXBpbGVyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NyZWF0ZUJpbmRpbmcobywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgcmVzdWx0W2tdID0gbW9kW2tdO1xyXG4gICAgcmVzdWx0LmRlZmF1bHQgPSBtb2Q7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHByaXZhdGVNYXApIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJpdmF0ZU1hcC5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgcHJpdmF0ZU1hcCwgdmFsdWUpIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBzZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlTWFwLnNldChyZWNlaXZlciwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbiIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGxdLCJuYW1lcyI6WyJUSlMiLCJyZWFkRmlsZVN5bmMiLCJlanMiLCJkaXJuYW1lIiwiZXhpc3RzU3luYyIsIm1rZGlycCIsIndyaXRlRmlsZVN5bmMiLCJlbW9qaSIsImNoYWxrIiwieWFyZ3NcbiAgICAgICAgICAgIC5vcHRpb24iLCJqb2luIiwiZmxvdyIsImN1cnJ5UmlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFEQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtB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
