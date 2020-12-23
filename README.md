# Doc-4-Type

根据 TypeScript 类型+代码注释自动生成代码文档的工具。支持生成的文档类型包括 markdown, html, 以及 json。

与 markdown 静态页面生成器(e.g. [vuepress](https://vuepress.vuejs.org/))搭配使用，可以实现类型文档自动化。可以查看 example 中的示例。

## Type as Doc / 类型即文档

传说中有一句话叫"类型是最好的注释"。例如以下类型，不看任何注释，我们也可以清晰明了地知道这个图形绘制配置项对象大概怎么使用。

```ts
Shape {
  type: 'circle' | 'square',
  width: number,
  height: number,
  fill: Color,
  stroke: Color
}
```

更进一步，我们希望可以做到类型直接生成文档，所以有了本项目。

## Background

Inspired and builds upon [typescript-json-schema](https://github.com/YousefED/typescript-json-schema).

## 安装

暂时还未发布包，计划中。目前想安装需要用 submodules 方式。

## CLI

```
node lib/doc4type/bin/doc4type
Options:
      --version        Show version number                             [boolean]
  -p, --input, --path  The path of input file                [string] [required]
  -o, --output         The path of output file                          [string]
  -r, --root           The root of files                                [string]
  -t, --typeName       The type name that to be doc          [string] [required]
  -f, --format         The doc format, one of: [0,1,2,markdown,json,html]
                                                  [string] [default: "markdown"]
      --help           Show help                                       [boolean]
```

## TIP

- 推荐多使用 `Interface`，这样可以在编译解析时保留接口名称，而 `Type` 会被丢弃。 


## 注释 API

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
- [ ] 提供 dir + name 替代 outputPath
- [ ] 自定义生成的文档片段格式
- [ ] Union 类型的文档生成如何与 Object prop 区分
- [x] 顶层 union type 问题 - 已提 issue
- [ ] 发布 npm 包
- [ ] 发布主页
- [ ] 复杂文档片段的生成
