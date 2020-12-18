type B = {
  /**
   * @description this is b1
   * 
   * @TJS-examples 
   * {
   *  b11: {
   *    b111: 1,
   *    b112: 2
   *  },
   *  b12: 3
   * }
   */
  b1: {
    b11: {
      b111: string;
      b112: string;
    };
    b12: string;
  };
  b2: number;
  b3: {
    foo: C;
  };
};

type C = {
  c1: string;
  c2?: number;
}[];

export type A = B | C;
