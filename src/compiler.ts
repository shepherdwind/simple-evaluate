import evaluate from './simple-evaluate';
const get = require('get-value');

export const OPERATION: { [key: string]: number } = {
  '!': 5,
  '*': 4,
  '/': 4,
  '%': 4,
  '+': 3,
  '-': 3,
  '>': 2,
  '<': 2,
  '>=': 2,
  '<=': 2,
  '===': 2,
  '!==': 2,
  '==': 2,
  '!=': 2,
  '&&': 1,
  '||': 1,
  '?': 1,
  ':': 1,
};

export interface Node {
  left: Node | string | null;
  right: Node | string | null;
  operation: string;
  grouped?: boolean;
};

export type GetValueFunction<T = object> = (context: T, path: string) => any;

export default class Compiler {

  blockLevel = 0;
  private index = -1;
  private getValueFn: GetValueFunction;

  private token: string[];

  constructor(token: string[], getValue?: GetValueFunction) {
    this.token = token;
    this.getValueFn = getValue || get;
  }

  parse(): Node | string {
    let tok;
    let root: any = {
      left: null,
      right: null,
      operation: null,
    };

    do {
      tok = this.parseStatement();
      // 括号结束
      if (tok === null || tok === undefined) {
        break;
      }

      if (root.left === null) {
        root.left = tok;
        root.operation = this.nextToken();
        // 只有一个左节点 !!$foo
        if (!root.operation) {
          return tok;
        }

        root.right = this.parseStatement();
      } else {
        if (typeof tok !== 'string') {
          throw new Error('operation must be string, but get ' + JSON.stringify(tok));
        }
        root = this.addNode(tok, this.parseStatement(), root);
      }
    } while (tok);

    return root;
  }

  calc(node: Node | string, context: any): any {
    if (typeof node === 'string') {
      return this.getValue(node, context);
    }

    // 不支持的运算符号
    if (OPERATION[node.operation] === undefined) {
      throw new Error('unknow expression ' + node.operation);
    }

    if (node.operation === '!' && node.right) {
      return !this.getValue(node.right, context);
    }

    const left = this.getValue(node.left, context);
    if (node.operation === undefined) {
      return left;
    }

    const right = this.getValue(node.right, context);

    switch(node.operation) {
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '>':
        return left > right;
      case '%':
        return left % right;
      case '<':
        return left < right;
      case '>=':
        return left >= right;
      case '<=':
        return left <= right;
      case '==':
        // tslint:disable-next-line:triple-equals
        return left == right;
      case '===':
        // tslint:disable-next-line:triple-equals
        return left === right;
      case '!==':
        // tslint:disable-next-line:triple-equals
        return left !== right;
      case '!=':
        // tslint:disable-next-line:triple-equals
        return left != right;
      case '&&':
      case '?':
        return left && right;
      case '||':
      case ':':
        return left || right;
    }
  }

  private nextToken() {
    this.index += 1;
    return this.token[this.index];
  }

  private prevToken() {
    return this.token[this.index - 1];
  }

  private addNode(operation: string, right: Node | string | null, root: Node) {
    let pre = root;
    // 增加右节点
    if (this.compare(pre.operation, operation) < 0 && !pre.grouped) {
      // 依次找到最右一个节点
      while (pre.right !== null &&
        typeof pre.right !== 'string' &&
        this.compare(pre.right.operation, operation) < 0 && !pre.right.grouped) {
        pre = pre.right;
      }

      pre.right = {
        operation,
        left: pre.right,
        right,
      };
      return root;
    }

    // 增加一个左节点
    return {
      left: pre,
      right,
      operation,
    }
  }

  private compare(a: string, b: string) {
    if (!OPERATION.hasOwnProperty(a) || !OPERATION.hasOwnProperty(b)) {
      throw new Error(`unknow operation ${a} or ${b}`);
    }
    return OPERATION[a] - OPERATION[b];
  }


  private getValue(val: string | Node | null, context: any) {
    if (typeof val !== 'string' && val !== null) {
      return this.calc(val, context);
    }

    if (val === null || OPERATION[val] !== undefined) {
      throw new Error('unknow value ' + val);
    }

    // 上下文查找
    if (val.indexOf('$.') !== -1) {
      return this.getValueFn(context, val.slice(2));
    }

    // 字符串
    if (val[0] === '\'' || val[0] === '"') {
      return val.slice(1, -1);
    }

    if (val[0] === '`') {
      return this.parseTemplateString(val.slice(1, -1), context);
    }

    // 布尔
    if (val === 'true') {
      return true;
    }

    if (val === 'false') {
      return false;
    }
    // is number
    const value = parseFloat(val);
    if (!isNaN(value)) {
      return value;
    }

    // all other lookup from context
    return this.getValueFn(context, val);
  }

  private parseTemplateString(input: string, context: any) {
    return input.replace(/\${(.*?)}/g, (_a, b) => {
      return evaluate(context, b, { getValue: this.getValueFn });
    });
  }

  private parseStatement(): string | Node | null {
    const token = this.nextToken();
    if (token === '(') {
      this.blockLevel += 1;
      const node = this.parse();
      this.blockLevel -= 1;

      if (typeof node !== 'string') {
        node.grouped = true;
      }
      return node;
    }

    if (token === ')') {
      return null;
    }

    if (token === '!') {
      return { left: null, operation: token, right: this.parseStatement() }
    }

    // 3 > -12 or -12 + 10
    if (token === '-' && (OPERATION[this.prevToken()] > 0 || this.prevToken() === undefined)) {
      return { left: '0', operation: token, right: this.parseStatement(), grouped: true };
    }

    return token;
  }
}
