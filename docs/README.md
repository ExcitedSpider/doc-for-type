# Doc-4-Type

> 🎉 本项目已发布 beta 版，[欢迎试用](https://www.npmjs.com/package/doc-for-type)

[![npm version](https://img.shields.io/npm/v/doc-for-type.svg)](https://www.npmjs.com/package/doc-for-type)

根据 TypeScript 类型+代码注释自动生成代码文档的工具。支持生成的文档类型包括 markdown, html, 以及 json。

与 markdown 静态页面生成器(e.g. [vuepress](https://vuepress.vuejs.org/))搭配使用，可以实现类型文档自动化。可以查看 example 中的示例。

## Type as Doc / 类型即文档

江湖中有一句话叫"类型是最好的注释"。例如以下类型，不看任何注释，我们也可以清晰明了地知道这个图形绘制配置项对象大概怎么使用。

```ts
/** 绘制一个基本图形 */
Shape {
  /** 椭圆还是矩形 */
  type: 'circle' | 'square',
  width: number,
  height: number,
  fill: Color,
  stroke: Color
}
```

更进一步，我们希望可以做到通过类型直接生成文档，免去耗时的手工文档工作。搭配一些页面生成器就能轻易生成主页。

```md
# Shape

* type: `object`
* 描述: 绘制一个基本图形

## type

* type: `'circle' | 'square'`
* 描述: 椭圆还是矩形

```

这就是本项目的基本愿景。

## Background

Inspired and builds upon [typescript-json-schema](https://github.com/YousefED/typescript-json-schema).

## QuickStart

假设我们的目录结构:

```
.
├── package-lock.json
├── package.json
└── src
    ├── main.js
    └── type.ts <- 想要生成文档的类型文件 
```

其中，type.ts 中定义了一个类型 `MyObject`:

```ts
interface Type1 {
  value1: string;
  value2: number;
}
interface Type2 {
  value2: number;
  value3: boolean;
}

interface MyObject {
  value: Type1 & Type2;
}
```

本工具有两种方式可供使用: JS API 或 CLI。功能完整度相同，都会生成一样的 markdown 文档。

## JS API
```bash
$ npm i doc-for-type
```

```js
// main.js
const { doc4Type } = require("doc-for-type");
const { join } = require("path");

doc4Type({
  path: join(__dirname, "./type.ts"),
  typeName: "MyObject",
  format: 'markdown',
});
```

```bash
$ node src/main.js
```

## CLI

```bash
$ npm i doc-for-type -g
$ doc4type --input ./src/type.ts --typeName MyObject
```

## API 详解

可以查看 [APIOption 章节](APIOption.html)

```
Options:
      --version        Show version number                             [boolean]
  -p, --input, --path  The path of input file                [string] [required]
  -o, --output         The path of output file                          [string]
  -r, --root           The root of files                                [string]
  -t, --typeName       The type name that to be doc          [string] [required]
  -f, --format         The doc format, one of:        [0,1,2,markdown,json,html]
                                                  [string] [default: "markdown"]
      --help           Show help                                       [boolean]
```

## TIP

- 推荐多使用 `Interface`，这样可以在编译解析时保留接口名称，而 `Type` 会被丢弃。 


## 注释 API

不使用注释也可以按照类型生成文档的基本结构，但使用注释会让生成的文档可读性更高。

本项目实现的注释是 jsdoc 的子集，语法相同。

### @description

生成一段说明文档。没有任何 jsdoc 标注的注释内容也将被视为 `@description` 内容。

输入：

```ts
/** 
 * @description This is a Circle
 */
interface Circle {
  kind: "circle";
  radius: number;
}
```

输出：

```md
## Circle
* 类型: `object`
* 描述: This is a Circle
```

### @example 

生成一段代码示例文档

输入：

```ts
/** 
 * @example { kind: 'circle', radius: 5}
 */
interface Circle {
  kind: "circle";
  radius: number;
}
```

输出：

```md
## Circle 
* 类型: `object`
* 描述: 暂无描述 
* 示例:
{ kind: 'circle', radius: 5} 
```

### @link

生成链接，用于处理一些比较复杂深层的类型。使用了 @link 的类型，将不会生成 json 子类型描述。

输入：

```ts
/** 
 * @link /components/Circle
 */
interface Circle {
  kind: "circle";
  radius: number;
}
```

输出：

```md
## [Circle](/components/Circle)
* 类型: `object`
* 描述: 暂无描述 
```

### @default

生成默认值描述。

输入:

```ts
interface MyObject {
  /**
   * @default true
   */
  varBoolean: boolean;
  /**
   * @default 123
   */
  varInteger: number;
  /**
   * @default "foo"
   */
  varString: string;
}
```

输出:

```md
## varBoolean <small>`required`</small> 

* 类型: `boolean`
* 描述: 暂无描述 
* 默认值: `true`

## varInteger <small>`required`</small> 

* 类型: `number`
* 描述: 暂无描述 
* 默认值: `123`

## varFloat <small>`required`</small> 

* 类型: `number`
* 描述: 暂无描述 
* 默认值: `3.21`
```

## TODO

- [x] 仅能展开到两层
- [x] 每一个逻辑都要处理 `properties` `anyof` `array` 太麻烦了
- [x] 需要展开的配置项目没有根页面
- [x] 自动侧边栏生成问题
- [x] 支持注释 hint
- [x] @link 的支持
- [ ] 文档更新的问题 - 很难解决
- [x] test case
- [x] @quote 公共片段渲染 - 不做，因为 markdown 标准语法中没有引用外部片段的定义。
- [x] required 的支持
  - [ ] required 可配置是否开启
- [x] default 的支持
- [ ] ejs 可读性太差
- [x] 输出 JSON
  - [x] 支持文件名后缀自动生成
  - [x] 接 remark 库，可以生成 html、也可以支持开发插件
- [x] 输出其他更多格式
- [ ] unified 插件支持
- [ ] 提供 dir + name 替代 outputPath - 不太需要
- [ ] 自定义生成的文档片段格式
- [ ] Union 类型的文档生成如何与 Object prop 区分
- [x] 顶层 union type 问题 - 已提 issue
- [x] 发布 npm 包
- [x] API 支持输入字符串 format 而不仅是枚举
- [ ] 主页
- [ ] 复杂文档片段的生成
- [ ] 工程化
  - [ ] 自动发布流水线
  - [ ] eslint 