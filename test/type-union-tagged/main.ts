/**
 * 绘制正方形
 * @example
 * // 在图表中绘制一个 10 * 10 px 的正方形
 * { kind: 'square', size: 10} 
 */
interface Square {
  /** 类型枚举 */
  kind: "square";
  /** 尺寸 */
  size: number;
}

/** 
 * 绘制矩形
 * @link #Rectangle 
 */
interface Rectangle {
  /** 类型枚举 */
  kind: "rectangle";
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/** 
 * 绘制圆形
 * @example { kind: 'circle', radius: 5}
 */
interface Circle {
  kind: "circle";
  radius: number;
}

/** 绘制的图形基本类 */
type Shape = Square | Rectangle | Circle;