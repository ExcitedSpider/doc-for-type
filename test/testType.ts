type B = {
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
