export default function token(expression: string): string[] {
  let index = 0;
  let prevIndex = 0;
  let tokenList = [];

  while (expression[index] !== undefined) {
    const tok = expression[index];
    switch (tok) {
      case '=':
      case '&':
      case '|':
        if (expression[index + 1] === tok) {
          tokenList.push(expression.slice(prevIndex, index));
          // ===
          if (tok === '=' && expression[index + 2] === tok) {
            index += 1;
            prevIndex = index + 1;
            tokenList.push(tok + tok + tok);
          } else {
            tokenList.push(tok + tok);
          }

          index += 1;
          prevIndex = index + 1;
        }
        break;

      case '\'':
      case '"':
        // 字符处理中间遇到其他特殊符号，一直找到后面一个引号或者单引号结束
        // 不支持转义
        const bak = index;
        let next;
        do {
          next = expression[index + 1];
          index += 1;
        } while(next !== tok && next !== undefined);

        tokenList.push(expression.slice(prevIndex, index + 1));
        prevIndex = index + 1;
        break;

      case '!':
      case '(':
      case ')':
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
      case '>':
      case '<':
        // >= <=
        if ((tok === '>' || tok === '<' || tok === '!') && expression[index + 1] === '=') {
          tokenList.push(expression.slice(prevIndex, index));

          // !==
          if (tok === '!' && expression[index + 2] === '=') {
            index += 1;
            prevIndex = index + 1;
            tokenList.push(tok + '==');
          } else {
            tokenList.push(tok + '=');
          }
          index += 1;
          prevIndex = index + 1;
          break;
        }

        tokenList.push(expression.slice(prevIndex, index));
        tokenList.push(tok);
        prevIndex = index + 1;
        break;
    }

    index += 1;
  }

  if (prevIndex < index) {
    tokenList.push(expression.slice(prevIndex, index + 1));
  }
  return tokenList.map(o => o.trim()).filter(o => o);
}
