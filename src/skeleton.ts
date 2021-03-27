import type { Position, Token } from "./lexer";

export type SkeletonTree =
  | { type: "Leaf"; token: Token }
  | { type: "Branch"; start: Token; end: Token; items: SkeletonTree[] };

function getBalancedRangeLength<T>({
  data,
  isStart,
  isEnd,
}: {
  data: T[];
  isStart: (item: T) => boolean;
  isEnd: (item: T) => boolean;
}): number {
  let length = 0;
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

function* skel(tokens: Token[]): Generator<SkeletonTree> {
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    switch (tok.type) {
      case "Identifier":
      case "Number":
      case "String":
      case "PropertyAssign":
      case "ArrayEnd":
      case "ObjectEnd":
        yield { type: "Leaf", token: tok };
        i++;
        break;
      case "ArrayStart":
      case "ObjectStart": {
        const endType = tok.type === "ArrayStart" ? "ArrayEnd" : "ObjectEnd";
        const rest = tokens.slice(i);
        const length = getBalancedRangeLength({
          data: rest,
          isStart: (t) => t.type === tok.type,
          isEnd: (t) => t.type === endType,
        });
        yield {
          type: "Branch",
          start: tok,
          end: tokens[i + length - 1],
          items: Array.from(skel(rest.slice(1, -1))),
        };
        i += length;
        break;
      }
      default:
        throw new Error(`skel: invalid type: ${tok.type}`);
    }
  }
}

export function skeletize(tokens: Token[]): SkeletonTree[] {
  return Array.from(skel(tokens));
}
