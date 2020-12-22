# 类型自动生成文档

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

## TODO

- [x] 仅能展开到两层
- [x] 每一个逻辑都要处理 `properties` `anyof` `array` 太麻烦了
- [x] 需要展开的配置项目没有根页面
- [x] 自动侧边栏生成问题
- [x] 支持注释 hint
- [x] @link 的支持
- [x] test case
- [ ] @quote 公共片段渲染
- [ ] 文档更新的问题
- [ ] 支持输出 JSON
