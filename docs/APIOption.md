# APIOption

*   类型: `object`
*   描述: doc-for-type 的调用参数
*   示例:

```js
const option:APIOption = {
 input: join(__dirname, "./type.ts"),
 typeName: "MyObject",
 format: 'markdown',
}

doc4Type(option); 
```

## input <sup>`required`</sup>

*   类型: `string`
*   描述: 输入的类型文件路径

## typeName <sup>`required`</sup>

*   类型: `string`
*   描述: 需要生成文档的类型名称

## root

*   类型: `string`
*   描述: 项目根目录，一般情况下不需要使用

## output

*   类型: `string`
*   描述: 输出的文档路径，默认在输入文件的同目录下
*   默认值: `${dirname(input)}\${typeName}.md`

## format

*   类型: `0 | 1 | 2 | "html" | "json" | "markdown" | "md"`
*   描述: 生成的文档类型
*   默认值: `'markdown'`
