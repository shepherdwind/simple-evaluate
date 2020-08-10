import token from './token';
import Compiler, { GetValueFunction, Node } from './compiler';

export default function evaluate(context: any, expr: string, option?: {
  getValue: GetValueFunction;
}) {
  const tokenList = token(expr);
  const compiler = new Compiler(tokenList, option && option.getValue);
  const astTree = compiler.parse();
  return compiler.calc(astTree, context);
}
export { Compiler, token, Node };
