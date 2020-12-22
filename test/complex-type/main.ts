type ISubB = {
  /**
   * this is IB1
   */
  IB1: {
    /**
     * @link 
     */
    IB11: {
      IB111: string;
      IB112: string;
    };
    IB12: string;
  };
  /** don't use @description */
  IB2: number;
  IB3: {
    foo: ISubC;
  };
};

type ISubC = {
  IC1: string;
  IC2?: number;
}[];

/** @example lugangxiaozhen */
export type IComplex = ISubB | ISubC;
