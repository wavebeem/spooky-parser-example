import type { AST } from "./ast";

export type Data =
  | string
  | number
  | boolean
  | null
  | Data[]
  | { [key: string]: Data };

// TODO
export function toData(ast: AST): Data {
  throw new Error("not implemented");
}
