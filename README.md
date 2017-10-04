# Simple Evaluate

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/simple-evaluate.svg?style=flat-square
[npm-url]: http://npmjs.org/package/simple-evaluate
[download-image]: https://img.shields.io/npm/dm/simple-evaluate.svg?style=flat-square
[download-url]: https://npmjs.org/package/simple-evaluate
[travis-image]: https://img.shields.io/travis/shepherdwind/velocity.js.svg?style=flat-square
[travis-url]: https://travis-ci.org/shepherdwind/velocity.js
[coveralls-image]: https://img.shields.io/coveralls/shepherdwind/velocity.js.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/shepherdwind/velocity.js?branch=master


A safe parse for simple js expression.

### Usage

```js
import evaluate from 'simple-evaluate';
evaluate(null, '12 + 1 > 14');
evaluate({ a }, '$.a + 1 > 14');
```

### Support operation include

- Math operator `+ - * /`
- Comparison `> < >= <= == !=`
- Logical `&& || !`
- Negation

You can run those expression, for example:

```js
evaluate({}, '!$.a > 0');
evaluate({}, '$.a > 0 || $.a < -12 || 12 + 2*(4 + 4) < 12');
evaluate({ a: 1 }, '-$.a * 2');
```

### context find

`$.` stand for the root value all `context`, value path only support '.', and not support function call.

### string and boolean

String and boolean support, string start with `' | "`, just the same as javascript expresion.

Boolean use two key words, `true | false`.

### Operation no support

- Funcion call

So, you can not run those expression

```js
evaluation({}, '-$.a > 0');
evaluation({}, '$.a(1) > 0');
```