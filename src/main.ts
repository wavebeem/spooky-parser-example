import { lex } from "./lexer";
import { skeletize } from "./skeleton";
import { treeify } from "./ast";
import { toData } from "./convert";

const code = `
# Hello
# World
foo = {
  x = 1 # nice
  y = 2
  # This is some documentation
  # About the field "name"
  name = "Brian"
  itsTrue = true
  its_false = false
  an_array_for_you = [1 2 3 "hello" {}]
}
`;
const tokens = lex(code);
console.log(tokens);
const skeleton = skeletize(tokens);
console.log(skeleton);
const ast = treeify(skeleton);
console.log(ast);
const data = toData(ast);
console.log(data);
