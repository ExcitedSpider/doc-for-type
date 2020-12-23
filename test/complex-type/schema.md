
# IComplex  

* 类型: `union`
  * 可选: `object`
  * 可选: `array`
* 描述: 暂无描述 

## object  

* 类型: `object`
* 描述: 暂无描述 

### IB1 <small>`required`</small> 

* 类型: `object`
* 描述: this is IB1 

#### IB11 <small>`required`</small> 

* 类型: `object`
* 描述: 暂无描述 
* 子类型描述
  ```js
  {
    IB111:string,
    IB112:string,
  }
  ```
#### IB12 <small>`required`</small> 

* 类型: `string`
* 描述: 暂无描述 
* 默认值: `'hehe'`

### IB2 <small>`required`</small> 

* 类型: `number`
* 描述: don't use @description 

### IB3 <small>`required`</small> 

* 类型: `object`
* 描述: 暂无描述 

#### foo <small>`required`</small> 

* 类型: `object[]`
* 描述: 暂无描述 
* 子类型描述
  ```js
  {
    IC1:string,
    IC2:number,
  }
  ```
## array  

* 类型: `object[]`
* 描述: 暂无描述 

### IC1 <small>`required`</small> 

* 类型: `string`
* 描述: 暂无描述 

### IC2  

* 类型: `number`
* 描述: 暂无描述 
 