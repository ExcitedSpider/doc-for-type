# Shape

*   类型: `union`
    *   可选: `Square`
    *   可选: `Rectangle`
    *   可选: `Circle`
*   描述: 绘制的图形基本类

## Square

*   类型: `object`
*   描述: 绘制正方形
*   示例:

```js
// 在图表中绘制一个 10 * 10 px 的正方形
{ kind: 'square', size: 10} 
```

### kind <sup>`required`</sup>

*   类型: `"square"`
*   描述: 类型枚举

### size <sup>`required`</sup>

*   类型: `number`
*   描述: 尺寸

## [Rectangle](#Rectangle)

*   类型: `object`
*   描述: 绘制矩形

### kind <sup>`required`</sup>

*   类型: `"rectangle"`
*   描述: 类型枚举

### width <sup>`required`</sup>

*   类型: `number`
*   描述: 宽度

### height <sup>`required`</sup>

*   类型: `number`
*   描述: 高度

## Circle

*   类型: `object`
*   描述: 绘制圆形
*   示例:

```js
{ kind: 'circle', radius: 5} 
```

### kind <sup>`required`</sup>

*   类型: `"circle"`
*   描述: 暂无描述

### radius <sup>`required`</sup>

*   类型: `number`
*   描述: 暂无描述
