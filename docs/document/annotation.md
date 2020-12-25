# 使用注释 API

使用注释 API 可以在生成的文档中插入对应的内容

不使用注释也可以按照类型生成文档的基本结构，但使用注释会让生成的文档可读性更高。

本项目实现的注释是 jsdoc 的子集，语法相同。

## @description

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

## @example 

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

## @link

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

## @default

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

## @title

仅能够用于顶层类型。为生成的文档配置标题。除了使用 `@title`，也可以在 API 或 CLI 调用时使用 `--title` 参数。详情可参考 [API 文档](APIOption.html#title)

输入:

```ts
/** 
 * @title 配置项文档
 */
type Option = { value: number}
```

输出

```markdown
# 配置项文档
* 类型: `object`
* 描述: 暂无描述 

## value
* 类型: `number`
* 描述: 暂无描述 
```

## @fragment

在标题下部直接嵌入一段 markdown 片段，用于生成一些比较复杂的片段。本项目会对 markdown 输出的格式进行 lint，可能出现多余的空行、缩进，属于正常现象。

输入:

```ts
/**
 * @fragment
 * 这是一个 `markdown` 片段
 * > 用于测试
 */
interface MyObject {
  /** 
   * @fragment
   * ![img](../assets/data.svg)
  */
  data: string
}
```

输出:

```md
# MyObject

这是一个 `markdown` 片段

> 用于测试

*   类型: `object`
*   描述: 暂无描述

## data <sup>`required`</sup>

![img](../assets/data.svg)

*   类型: `string`
*   描述: 暂无描述

```