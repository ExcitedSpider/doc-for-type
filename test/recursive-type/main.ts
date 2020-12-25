interface MyNode {
  children: MyNode[];
  tag: string;
  innerText: string;
  attribute: { [index: string]: string | number };
}
