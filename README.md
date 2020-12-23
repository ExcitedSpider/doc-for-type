# 类型自动生成文档

## TIP

- 推荐多使用 `Interface`，这样可以在编译解析时保留接口名称，而 `Type` 会被丢弃。 
- 顶层 `Type` 的注释信息存在 bug，无法解析 <- 依赖库的问题，等待PR

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
- [ ] 输出其他更多格式
- [ ] 提供 dir + name 替代 outputPath ？感觉似乎没有必要
- [ ] 自定义生成的文档片段格式
- [ ] Union 类型的文档生成如何与 Object prop 区分
- [ ] 顶层 union type 问题 - 已提 issue
