interface Square {
  kind: "square";
  size: number;
}

/** @link #Rectangle */
interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

/** 
 * @example { kind: 'circle', radius: 5}
 */
interface Circle {
  kind: "circle";
  radius: number;
}

type Shape = Square | Rectangle | Circle;