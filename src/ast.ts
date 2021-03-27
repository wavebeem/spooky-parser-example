import { assertNever } from "./assertNever";
import { Token, TokenIdentifier } from "./lexer";
import type { SkeletonTree } from "./skeleton";

interface BaseAST<T, V> {
  type: T;
  value: V;
  start: Token;
  end: Token;
}

export type ASTEntry = BaseAST<"Entry", { key: ASTString; value: AST }>;
export type ASTString = BaseAST<"String", string>;
export type ASTNumber = BaseAST<"Number", number>;
export type ASTBoolean = BaseAST<"Boolean", boolean>;
export type ASTNull = BaseAST<"Null", null>;
export type ASTArray = BaseAST<"Array", AST[]>;
export type ASTObject = BaseAST<"Object", ASTEntry[]>;

export type AST =
  | ASTString
  | ASTNumber
  | ASTBoolean
  | ASTNull
  | ASTArray
  | ASTObject;

function convertIdentifier(node: TokenIdentifier): ASTBoolean | ASTNull {
  switch (node.text) {
    case "true":
      return {
        type: "Boolean",
        value: true,
        start: node,
        end: node,
      };
    case "false":
      return {
        type: "Boolean",
        value: false,
        start: node,
        end: node,
      };
    case "null":
      return {
        type: "Null",
        value: null,
        start: node,
        end: node,
      };
    default:
      throw new Error(`convertIdentifier: bad node ${node.text}`);
  }
}

function convertKey(key: SkeletonTree): ASTString {
  if (key.type === "Branch") {
    throw new Error("convertKey: bad nesting");
  }
  switch (key.token.type) {
    case "Identifier":
    case "String":
    case "Number":
      return {
        type: "String",
        value: key.token.text,
        start: key.token,
        end: key.token,
      };
    default:
      throw new Error("convertKey: bad node");
  }
}

function map3<A, B>(items: A[], callback: (x1: A, x2: A, x3: A) => B): B[] {
  const ret: B[] = [];
  for (let i = 0; i < items.length; i += 3) {
    const x1 = items[i];
    const x2 = items[i + 1];
    const x3 = items[i + 2];
    ret.push(callback(x1, x2, x3));
  }
  return ret;
}

function convertEntries(items: SkeletonTree[]): ASTEntry[] {
  return map3(
    items,
    (key, eq, value): ASTEntry => {
      // TODO: assert `eq` is a `PropertyAssign`
      return {
        type: "Entry",
        value: { key: convertKey(key), value: convert(value) },
        start: getStart(key),
        end: getEnd(value),
      };
    }
  );
}

function convert(node: SkeletonTree): AST {
  switch (node.type) {
    case "Branch":
      switch (node.start.type) {
        case "ObjectStart":
          return {
            type: "Object",
            value: convertEntries(node.items),
            start: node.start,
            end: node.end,
          };
        case "ArrayStart":
          return {
            type: "Array",
            value: node.items.map(convert),
            start: node.start,
            end: node.end,
          };
        default:
          throw new Error(`convert: unknown type ${node.start.type}`);
      }
    case "Leaf":
      switch (node.token.type) {
        case "Identifier":
          return convertIdentifier(node.token);
        case "String":
          return {
            type: "String",
            value: node.token.text,
            start: node.token,
            end: node.token,
          };
        case "Number":
          return {
            type: "Number",
            value: Number(node.token.text),
            start: node.token,
            end: node.token,
          };
        default:
          throw new Error(`convert: unknown type ${node.token.type}`);
      }
    default:
      assertNever(node);
  }
}

function getStart(node: SkeletonTree): Token {
  return node.type === "Branch" ? node.start : node.token;
}

function getEnd(node: SkeletonTree): Token {
  return node.type === "Branch" ? node.end : node.token;
}

export function treeify(skel: SkeletonTree[]): AST {
  const first = skel[0];
  const last = skel[skel.length - 1];
  return {
    type: "Object",
    value: convertEntries(skel),
    start: getStart(first),
    end: getEnd(last),
  };
}
