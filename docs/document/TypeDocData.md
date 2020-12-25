# 以 JSON 格式输出

生成文档的 raw JSON 格式，可以用于二次开发。
使用 `--format json` 即可获取。

*   类型: `object`
*   描述: 暂无描述
*   例子:
    ```bash
    $ doc4type --input ./src/type.ts --typeName MyObject --format json
    ```

## type <sup>`required`</sup>

*   类型: `union`
    *   可选: `array`
    *   可选: `string`
*   描述: 暂无描述

### array

*   类型: `string[]`
*   描述: 暂无描述

### string

*   类型: `string`
*   描述: 暂无描述

## title

*   类型: `string`
*   描述: 暂无描述

## name <sup>`required`</sup>

*   类型: `string`
*   描述: 暂无描述

## subTypes <sup>`required`</sup>

*   类型: `string[]`
*   描述: 暂无描述

## example <sup>`required`</sup>

*   类型: `string`
*   描述: 暂无描述

## link <sup>`required`</sup>

*   类型: `string`
*   描述: 暂无描述

## desc <sup>`required`</sup>

*   类型: `string`
*   描述: 暂无描述

## children

*   类型: `TypeDocData[]`
*   描述: 暂无描述

## isRequired

*   类型: `boolean`
*   描述: 暂无描述

## defaultValue

*   类型: `string`
*   描述: 暂无描述 