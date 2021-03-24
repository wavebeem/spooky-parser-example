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

function matchAt(text: string, index: number, regexp: RegExp): string {
  const re = new RegExp(regexp, regexp.flags + "y");
  re.lastIndex = index;
  return text.match(re)?.[0] ?? "";
}

function advanceByText(pos: Position, text: string): Position {
  const ret = { ...pos };
  for (const ch of text) {
    if (ch === "\n") {
      ret.line++;
      ret.column = 1;
    } else {
      ret.column++;
    }
  }
  ret.index += text.length;
  return ret;
}

function* ilex(code: string): Generator<Token> {
  let start: Position = { index: 0, line: 1, column: 1 };
  let end = start;
  let comments: string[] = [];
  let text = "";
  while (start.index < code.length) {
    text = "";
    if ((text = matchAt(code, start.index, /\s+/))) {
      start = advanceByText(start, text);
      continue;
    }
    if ((text = matchAt(code, start.index, /#.*\n/))) {
      start = advanceByText(start, text);
      comments.push(text.slice(1, -1));
      continue;
    }
    const comment = comments.join("\n");
    if ((text = matchAt(code, start.index, /[a-z_]+/i))) {
      end = advanceByText(start, text);
      yield { type: "Identifier", comment, text, start, end };
    } else if ((text = matchAt(code, start.index, /[0-9]+/))) {
      end = advanceByText(start, text);
      yield { type: "Number", comment, text, start, end };
    } else if ((text = matchAt(code, start.index, /"(?:[^"]|\\")*"/))) {
      end = advanceByText(start, text);
      yield {
        type: "String",
        comment,
        text: text.slice(1, -1),
        start,
        end,
      };
    } else if ((text = matchAt(code, start.index, /\{/))) {
      end = advanceByText(start, text);
      yield { type: "ObjectStart", comment, text, start, end };
    } else if ((text = matchAt(code, start.index, /\}/))) {
      end = advanceByText(start, text);
      yield { type: "ObjectStart", comment, text, start, end };
    } else if ((text = matchAt(code, start.index, /\[/))) {
      end = advanceByText(start, text);
      yield { type: "ArrayStart", comment, text, start, end };
    } else if ((text = matchAt(code, start.index, /\]/))) {
      end = advanceByText(start, text);
      yield { type: "ArrayEnd", comment, text, start, end };
    } else if ((text = matchAt(code, start.index, /=/))) {
      end = advanceByText(start, text);
      yield { type: "PropertyAssign", comment, text, start, end };
    } else {
      // console.log(filename);
      // console.log(code);
      console.log(JSON.stringify(code.slice(start.index, start.index + 10)));
      throw new Error(
        `parse error: line ${start.line}, column ${start.column}`
      );
    }
    comments = [];
    start = end;
  }
}

export function lex(code: string): Token[] {
  return Array.from(ilex(code));
}
