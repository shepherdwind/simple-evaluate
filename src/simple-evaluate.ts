import token from './token';
import Compiler from './compiler';

export default function evaluate(context: any, expr: string) {
  const tokenList = token(expr);
  const compiler = new Compiler(tokenList);
  const astTree = compiler.parse();
  return compiler.calc(astTree, context);
}
