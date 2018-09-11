import evaluate, { Compiler, token } from "../src/simple-evaluate";
import 'should';

/**
 * Dummy test
 */
describe('simple evaluate', () => {
  it('compiler', () => {
    const compiler = new Compiler(token('a.b && c'));
    const tok = compiler.parse();
    if (typeof tok === 'string') {
      throw new Error('token should be node');
    }
    tok.operation.should.equal('&&');
  });

  it('basic expression', () => {
    const ret = evaluate(null, '1 * (2 + 3 * (4 - 3))');
    ret.should.equal(5);
    const ret1 = evaluate(null,
      '1 * (2 + 3 * (4 - 3)) > 10 - 2 || 3 * 2 > 9 - 2 * 3');
    ret1.should.equal(true);
    evaluate(null, '(9 - 2) * 3 - 10').should.equal(11);
    evaluate(null, '12 - 2 * -2 + (3 - 4) * 3.1').should.equal(12.9);

    [
      '9 / 12 + 12 * 3 - 5',
      '9 / 12 + 12 * (3 - 5)',
      '12 > 13.1',
      '12 < 14',
      '12 <= 14',
      '12 >= 14',
      '12 == 14',
      '12 === 14',
      '12 === 12',
      '12 % 5 > 3',
      '12 != 14',
      '12 !== 14',
      '12 !== 12',
      '9 - 1 > 10 && 3 * 5 > 10',
      '9 - 1 > 10 || 3 * 5 > 10',
    ].map(expression => {
      // tslint:disable-next-line:no-eval
      evaluate(null, expression).should.equal(eval(expression));
    });
  });

  it('negative', () => {
    evaluate({ a: 1 }, '$.a > 0 || $.a < -12').should.equal(true);
    evaluate({ a: 1 }, '$.a > 0 && $.a < -12').should.equal(false);
    evaluate({ a: 1 }, '$.a + 1 > 0 && -$.a > -12').should.equal(true);
    evaluate({ a: 1 }, '-($.a + 1) < 0 || -($.a + 2) > -12').should.equal(true);
    evaluate({ a: 1 }, '-$.a * 2').should.equal(-2);
  });

  it('negative, not $.', () => {
    evaluate({ a: 1 }, 'a > 0 || $.a < -12').should.equal(true);
    evaluate({ a: 1 }, 'a > 0 && a < -12').should.equal(false);
    evaluate({ a: 1 }, 'a + 1 > 0 && - a > -12').should.equal(true);
    evaluate({ a: 1 }, '-(a + 1) < 0 || -(a + 2) > -12').should.equal(true);
    evaluate({ a: 1 }, '-a * 2').should.equal(-2);
  });

  it('read var from context', () => {
    evaluate({ a: 10 }, '(9 - 2) * 3 - $.a').should.equal(11);
    evaluate({ a: 10, b: 2 }, '(9 - $.b) * 3 - $.a').should.equal(11);
    evaluate({ a: 10, b: 2 }, '$.a > $.b').should.equal(true);
    evaluate({ a: 10, b: 2 }, '$.a > $.b == false').should.equal(false);
    evaluate({ a: 10, b: 2 }, '$.a > $.b == true').should.equal(true);
    evaluate({ a: 'foo' }, '$.a == \'foo\'').should.equal(true);
    evaluate({ a: 'foo' }, '$.a === \'foo\'').should.equal(true);
    evaluate({ a: 'foo' }, '$.a != \'foo\'').should.equal(false);
    evaluate({ a: 'foo' }, '$.a !== \'foo\'').should.equal(false);
    evaluate({ a: 'foo' }, '$.a !== \'fo\'').should.equal(true);
    evaluate({ a: 'foo' }, '$.a == "foo" && 1 > 0').should.equal(true);

    evaluate({ a: 'foo' }, '!!$.a').should.equal(true);
    evaluate({ a: 'foo' }, '!$.a').should.equal(false);
    evaluate({ a: 'foo' }, '$.a').should.equal('foo');
    evaluate({ a: 'foo' }, '!($.a > "foa") || 1 > 2').should.equal(false);
    evaluate({ a: 'foo' }, '!($.a > "foa") || 1 < 2').should.equal(true);
  });

  it('read var from context, no ', () => {
    evaluate({ a: 10 }, '(9 - 2) * 3 - a').should.equal(11);
    evaluate({ a: 10, b: 2 }, '(9 - b) * 3 - a').should.equal(11);
    evaluate({ a: 10, b: 2 }, 'a > b').should.equal(true);
    evaluate({ a: 10, b: 2 }, 'a > b == false').should.equal(false);
    evaluate({ a: 10, b: 2 }, 'a > b == true').should.equal(true);
    evaluate({ a: 'foo' }, 'a == \'foo\'').should.equal(true);
    evaluate({ a: 'foo' }, 'a === \'foo\'').should.equal(true);
    evaluate({ a: 'foo' }, 'a != \'foo\'').should.equal(false);
    evaluate({ a: 'foo' }, 'a !== \'foo\'').should.equal(false);
    evaluate({ a: 'foo' }, 'a !== \'fo\'').should.equal(true);
    evaluate({ a: 'foo' }, 'a == "foo" && 1 > 0').should.equal(true);

    evaluate({ a: 'foo' }, '!!a').should.equal(true);
    evaluate({ a: 'foo' }, '!a').should.equal(false);
    evaluate({ a: 'foo' }, 'a').should.equal('foo');
    evaluate({ a: 'foo' }, '!(a > "foa") || 1 > 2').should.equal(false);
    evaluate({ a: 'foo' }, '!(a > "foa") || 1 < 2').should.equal(true);
  });

  it('expression which not supported', () => {
    const gen = expression => () => evaluate({ a: 10 }, expression);
    gen('$.a("foo") * 2').should.throw(/unknow expression/);
    gen('$.a() * 2').should.throw(/unknow operation/);
    gen('$.a ** -2').should.throw(/operation must be string/);
    gen('$.a == "1>2"(1 + 2)').should.throw(/operation must be string/);
    gen('$.a|1').should.throw(/unkonw token/);
  });

  it('string parse', () => {
    evaluate({ a: '1>2' }, '$.a == "1>2"').should.equal(true);
    evaluate({ a: '' }, '$.a == ""').should.equal(true);
    evaluate({ a: '"' }, '$.a == \'"\'').should.equal(true);
    evaluate({ a: '\'a\'' }, '$.a == "\'a\'" && $.a != "a"').should.equal(true);
  });
})
