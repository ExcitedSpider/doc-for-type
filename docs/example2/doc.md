# MyInterface

* 类型: `union`
	* `MyInterfaceUnion1`
	* `MyInterfaceUnion2`
	* `MyInterfaceUnion3`

* 描述: 一级标题的 Union 在下文展开

## MyInterfaceUnion1

* 类型: `object`
* 描述: 描述是通过注释的 `@description` 项提取出来 

### propA 

* 类型: `string`
* 描述: 描述是通过注释的 `@description` 项提取出来 
* 示例: 
	```js
	// 示例是通过注释的 `@example` 项提取出来 
	const propA = 1
	```
	
### propB

* 类型: [`SubPropB`](http://doc.example.io/SubpropB)
* 描述: 二层以上的结构，如果比较复杂，可以通过 link 链接到其他页面。在注释中写 `@link` 启用

### propC

* 类型:
	```js
	{
		a: { 
			type: 'string'
		},
		b: {
			type: 'number'
		}
	}
	```
* 描述: 二层以上的结构，如果比较简单，也可以直接展示 dom 结构。此为默认行为。

### propC

* 类型: `union`

## MyInterfaceUnion2

* 类型: `string`
* 描述: 描述是通过注释的 `@description` 项提取出来 

## MyInterfaceUnion3

* 类型: `union`
	* `string`
	* `object`
  ```js
  {
    a: { 
      type: 'string'
    },
    b: {
      type: 'number'
    }
  }
  ```
	* `number`
* 描述: 描述是通过注释的 `@description` 项提取出来 