'use strict';

var yargs = require('yargs');
var TJS = require('typescript-json-schema');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var ejs = require('ejs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var TJS__default = /*#__PURE__*/_interopDefaultLegacy(TJS);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var mkdirp__default = /*#__PURE__*/_interopDefaultLegacy(mkdirp);
var ejs__default = /*#__PURE__*/_interopDefaultLegacy(ejs);

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

const GENERATE_ROOT_DIR = path.join(__dirname, "../docs/");
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
/**
 * 将 schema 对象的 propName prop 构建为完整的对象（去除所有的 ref）
 * fieldName: 处理 schema 中的哪一个字段：默认 'properties'
 */
function buildProps(schema, propName) {
    if (typeof schema === "boolean" || typeof schema === "string") {
        return schema;
    }
    if (!schema.definitions || !schema.properties) {
        return schema.properties || {};
    }
    const propDef = schema.properties[propName];
    if (!propDef || typeof propDef === "boolean") {
        return propDef || {};
    }
    return tranverseAndReplaceRefObj(Object.assign({}, propDef), schema.definitions);
}
/**
 * 构造出 schema 对应的文件-内容列表
 * @returns {FileContentMap} fileContentMap 文件-内容表，例如`{'dir/a.md': '#你好'}`
 */
function buildFileContentMap(option) {
    return __awaiter(this, void 0, void 0, function* () {
        const { menu: optionMenu, schema, render: customRender } = option;
        if (typeof schema === "boolean") {
            return;
        }
        const fileContentMap = {};
        function handleProperties(subSchema, menu = optionMenu) {
            if (!subSchema || !subSchema.properties) {
                const mdxPath = `${menu}/doc.md`;
                fileContentMap[mdxPath] = JSON.stringify(subSchema, null, 2);
                return;
            }
            Object.keys(subSchema.properties).forEach((name) => __awaiter(this, void 0, void 0, function* () {
                const dirPath = path.join(GENERATE_ROOT_DIR, `/${menu}/${name}`);
                const mdxPath = `${dirPath}/doc.md`;
                fileContentMap[mdxPath] = customRender(subSchema, name, optionMenu);
            }));
        }
        function handleRecursiveUnion(schema, menu) {
            if (schema.anyOf) {
                schema.anyOf.forEach((subSchema, index) => {
                    const indexMenu = `${menu}/${index}`;
                    if (typeof subSchema === "boolean") {
                        return;
                    }
                    if (subSchema.anyOf) {
                        handleRecursiveUnion(subSchema, indexMenu);
                    }
                    else if (subSchema.type === "object" && subSchema.properties) {
                        handleProperties(subSchema, indexMenu);
                    }
                });
            }
            else if (schema.properties) {
                handleProperties(schema, menu);
            }
        }
        if (schema.anyOf) {
            const schemaWithNoRef = tranverseAndReplaceRefObj({ anyOf: schema.anyOf }, schema.definitions || {});
            if (typeof schemaWithNoRef === "boolean") {
                return;
            }
            handleRecursiveUnion(schemaWithNoRef, optionMenu);
        }
        else {
            handleProperties(schema);
        }
        return fileContentMap;
    });
}
/**
 * 将文件内容表写到文件系统上
 * @param fileContentMap 文件-内容Map，例如{'dir/a.md': '#你好'}
 */
function mapToFiles(fileContentMap) {
    return __awaiter(this, void 0, void 0, function* () {
        Object.keys(fileContentMap).forEach((filePath) => __awaiter(this, void 0, void 0, function* () {
            if (fs__default['default'].existsSync(filePath)) {
                console.log("already exist doc on", filePath);
                return;
            }
            const dirPath = path.dirname(filePath);
            console.log("create new doc on", dirPath);
            yield mkdirp__default['default'](dirPath);
            return new Promise((resolve, reject) => {
                fs__default['default'].writeFile(filePath, fileContentMap[filePath], (error) => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            });
        }));
    });
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
        const docMenu = menu || typeName;
        const schema = generateSchema(filePath, fileRoot, typeName);
        const ejsTemplate = ejs__default['default'].compile(fs__default['default'].readFileSync(path.join(__dirname, "../src/template/md.ejs"), {
            encoding: "utf8",
        }));
        const renderByEJS = (subSchema, name, menu) => {
            return ejsTemplate({
                name,
                menu,
                typeDesc: buildProps(subSchema, name),
            });
        };
        const fileContentMap = yield buildFileContentMap({
            render: renderByEJS,
            menu: docMenu,
            schema,
        });
        yield mapToFiles(fileContentMap || {});
    });
}
main();
