import React from "react";


export const MockComponent: React.FC<{ kind: string }> = ({
  children,
  kind,
  ...rest
}) => <div></div>;
