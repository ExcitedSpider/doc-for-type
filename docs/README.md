# Doc-4-Type

> 🎉 本项目已发布 beta 版，[欢迎试用](https://www.npmjs.com/package/doc-for-type)

[![npm version](https://img.shields.io/npm/v/doc-for-type.svg)](https://www.npmjs.com/package/doc-for-type)
![node-test](https://github.com/ExcitedSpider/doc-for-type/workflows/node-test/badge.svg)

根据 TypeScript 类型+代码注释自动生成代码文档的工具。支持生成的文档类型包括 markdown, html, 以及 json。

与 markdown 静态页面生成器(e.g. [vuepress](https://vuepress.vuejs.org/))搭配使用，可以实现类型文档自动化。

本文档也是工具搭配文档生成器VuePress使用的例子，可以查看 [docs](https://github.com/ExcitedSpider/doc-for-type/tree/master/docs) 中的示例。

## Type as Doc / 类型即文档

江湖中有一句话叫"类型是最好的注释"。例如以下类型，不看任何注释，我们也可以清晰明了地知道这个图形绘制配置项对象大概怎么使用。

```ts
/** 绘制一个基本图形 */
type Shape {
  /** 椭圆还是矩形 */
  type: 'circle' | 'square',
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

### JS API
```bash
$ npm i doc-for-type
```

```js
// main.js
const { doc4Type } = require("doc-for-type");
const { join } = require("path");

doc4Type({
  input: join(__dirname, "./type.ts"),
  typeName: "MyObject",
  format: 'markdown',
});
```

```bash
$ node src/main.js
```

### CLI

```bash
$ npm i doc-for-type -g
$ doc4type --input ./src/type.ts --typeName MyObject
```

## 了解详细使用方法

请查看我们的[API 文档](/document)。以及[注释 API](document/annotation.html) 的使用

## TIP

- 推荐多使用 `Interface`，这样可以在编译解析时保留接口名称，而 `Type` 会被丢弃。 

## 已知问题

* ~~对递归类型的支持 8 行~~ 现在行了，做了环检测
* 不展示 index type 的细节类型，只展示 `object`。因为暂时没想好怎么在文档里表现，有建议可以帮我提个 issue。

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
- [x] 主页
  - [ ] PlayGround
- [ ] 复杂文档片段的生成
- [ ] 生成 yaml 头内容
- [x] 生成 title
- [x] 递归类型的问题
- [ ] 支持 index type
- [ ] 工程化
  - [ ] 自动发布流水线
  - [ ] eslint
