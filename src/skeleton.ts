import type { Position, Token } from "./lexer";

export interface BaseSkeletonTree<T, V> {
  type: T;
  value: V;
  comment: string;
  start: Position;
  end: Position;
}

export type SkeletonTree =
  | BaseSkeletonTree<"Identifier", string>
  | BaseSkeletonTree<"String", string>
  | BaseSkeletonTree<"Number", number>
  | BaseSkeletonTree<"Object", SkeletonTree[]>
  | BaseSkeletonTree<"Array", SkeletonTree[]>;

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
  const root: SkeletonTree = {
    type: "Object",
    value: [],
    comment: "",
    start: tokens[0].start,
    end: tokens[tokens.length - 1].end,
  };
  return root;
}
