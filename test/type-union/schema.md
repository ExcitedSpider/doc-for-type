
# MyObject
* 类型: `object`
* 描述: Hello 

## var1
* 类型: `string,number`
* 描述: Simple union (generates "type": [...]) 

## var2
* 类型: `union`
  * 可选: `array`
  * 可选: `string`
* 描述: Non-simple union (generates a "oneOf"/"anyOf") 

### array
* 类型: `number[]`
* 描述: 暂无描述 

### string
* 类型: `string`
* 描述: 暂无描述 
 