import type { Position, Token } from "./lexer";

export type SkeletonTree =
  | { type: "Leaf"; token: Token }
  | { type: "Branch"; start: Token; end: Token; items: Token[] };

function getBalancedRangeLength<T>({
  data,
  isStart,
  isEnd,
}: {
  data: T[];
  isStart: (item: T) => boolean;
  isEnd: (item: T) => boolean;
}): number {
  let length = 1;
  let depth = 1;
  for (const item of data) {
    if (isStart(item)) {
      depth++;
    }
    if (isEnd(item)) {
      depth--;
      if (depth === 0) {
        return length;
      }
    }
    length++;
  }
  return length;
}

export function skeletize(tokens: Token[]): SkeletonTree {
  throw new Error("uh oh");
}
