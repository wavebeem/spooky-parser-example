// foo = {
//   x = 1
//   y = 2
//   name = "Brian"
//   itsTrue = true
//   its_false = false
//   an_array_for_you = [1 2 3 "hello" {}]
// }

export interface Position {
  index: number;
  line: number;
  column: number;
}

export interface BaseToken<T> {
  type: T;
  comment: string;
  text: string;
  start: Position;
  end: Position;
}

export type Token =
  | BaseToken<"Identifier">
  | BaseToken<"Number">
  | BaseToken<"String">
  | BaseToken<"ObjectStart">
  | BaseToken<"ObjectEnd">
  | BaseToken<"ArrayStart">
  | BaseToken<"ArrayEnd">
  | BaseToken<"PropertyAssign">;

function advanceByText(pos: Position, text: string): Position {
  let { index, line, column } = pos;
  for (const ch of text) {
    if (ch === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  index += text.length;
  return { index, line, column };
}

interface LexerRule {
  pattern: RegExp;
  callback: ({
    token,
    comment,
    match,
    start,
    end,
  }: {
    token: (type: Token["type"], text: string) => void;
    comment: (text: string) => void;
    match: RegExpMatchArray;
    start: Position;
    end: Position;
  }) => void;
}

class Lexer {
  constructor(public rules: LexerRule[]) {}

  lex(code: string): Token[] {
    let start: Position = { index: 0, line: 1, column: 1 };
    let end = start;
    let comments: string[] = [];
    const tokens: Token[] = [];
    const token = (type: Token["type"], text: string) => {
      const comment = comments.join("\n");
      comments = [];
      tokens.push({ type, text, start, end, comment });
    };
    const comment = (text: string) => {
      comments.push(text);
    };
    while (start.index < code.length) {
      for (const { pattern, callback } of this.rules) {
        const re = new RegExp(pattern, pattern.flags + "y");
        re.lastIndex = start.index;
        const match = code.match(re);
        if (match) {
          end = advanceByText(start, match[0]);
          callback({ token, comment, match, start, end });
          start = end;
          break;
        }
      }
    }
    return tokens;
  }
}

const rules: LexerRule[] = [
  {
    pattern: /\s+/,
    callback: () => {},
  },
  {
    pattern: /#(.*)\n+/,
    callback: ({ comment, match }) => {
      comment(match[1]);
    },
  },
  {
    pattern: /[0-9]+/,
    callback: ({ token, match }) => {
      token("Number", match[0]);
    },
  },
  {
    pattern: /\w+/,
    callback: ({ token, match }) => {
      token("Identifier", match[0]);
    },
  },
  {
    pattern: /"(?:[^"]|\\")*"/,
    callback: ({ token, match }) => {
      token("String", match[1]);
    },
  },
  {
    pattern: /\{/,
    callback: ({ token, match }) => {
      token("ObjectStart", match[0]);
    },
  },
  {
    pattern: /\}/,
    callback: ({ token, match }) => {
      token("ObjectEnd", match[0]);
    },
  },
  {
    pattern: /\[/,
    callback: ({ token, match }) => {
      token("ArrayStart", match[0]);
    },
  },
  {
    pattern: /\]/,
    callback: ({ token, match }) => {
      token("ArrayEnd", match[0]);
    },
  },
  {
    pattern: /=/,
    callback: ({ token, match }) => {
      token("PropertyAssign", match[0]);
    },
  },
  {
    pattern: /.*/,
    callback: ({ start }) => {
      throw new Error(
        `lex failure: line ${start.line}, column ${start.column}`
      );
    },
  },
];

export function lex(code: string): Token[] {
  return new Lexer(rules).lex(code);
}
