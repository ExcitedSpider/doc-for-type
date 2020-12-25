# Doc-4-Type

> 🎉 本项目已发布 beta 版，[欢迎试用](https://www.npmjs.com/package/doc-for-type)

[![npm version](https://img.shields.io/npm/v/doc-for-type.svg)](https://www.npmjs.com/package/doc-for-type)
![node-test](https://github.com/ExcitedSpider/doc-for-type/workflows/node-test/badge.svg)

根据 TypeScript 类型+代码注释自动生成代码文档的工具。支持生成的文档类型包括 markdown, html, 以及 json。

与 markdown 静态页面生成器(e.g. [vuepress](https://vuepress.vuejs.org/))搭配使用，可以实现类型文档自动化。可以查看 example 中的示例。

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

## Install / Usage / API

请前往[项目主页](https://excitedspider.github.io/doc-for-type/)查看。