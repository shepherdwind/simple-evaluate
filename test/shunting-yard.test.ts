import { evaluate } from "../src/shunting-yard";
import 'should';
import 'mocha';

/**
 * Dummy test
 */
describe("simple evaluate", () => {
  it('basic expression', () => {
    const ret = evaluate(null, '1 * (2 + 3 * (4 - 3))');
    ret.should.equal(5);
    const ret1 = evaluate(null,
      '1 * (2 + 3 * (4 - 3)) > 10 - 2 || 3 * 2 > 9 - 2 * 3');
    ret1.should.equal(true);
    evaluate(null, '(9 - 2) * 3 - 10').should.equal(11);

    [
      '9 / 12 + 12 * 3 - 5',
      '9 / 12 + 12 * (3 - 5)',
      '12 > 13.1',
      '12 < 14',
      '12 <= 14',
      '12 >= 14',
      '12 == 14',
      '12 % 5 > 3',
      '12 != 14',
      '9 - 1 > 10 && 3 * 5 > 10',
      '9 - 1 > 10 || 3 * 5 > 10',
    ].map(expression => {
      // tslint:disable-next-line:no-eval
      evaluate(null, expression).should.equal(eval(expression));
    });
  });

  it('read var from context', () => {
    evaluate({ a: 10 }, '(9 - 2) * 3 - $.a').should.equal(11);
    evaluate({ a: 10, b: 2 }, '(9 - $.b) * 3 - $.a').should.equal(11);
    evaluate({ a: 10, b: 2 }, '$.a > $.b').should.equal(true);
    evaluate({ a: 10, b: 2 }, '$.a > $.b == false').should.equal(false);
    evaluate({ a: 10, b: 2 }, '$.a > $.b == true').should.equal(true);
    evaluate({ a: 'foo' }, '$.a == \'foo\'').should.equal(true);
    evaluate({ a: 'foo' }, '$.a == "foo" && 1 > 0').should.equal(true);

    evaluate({ a: 'foo' }, '$.a').should.equal('foo');
  });

  it('string parse', () => {
    evaluate({ a: '1>2' }, '$.a == "1>2"').should.equal(true);
    evaluate({ a: '' }, '$.a == ""').should.equal(true);
    evaluate({ a: '"' }, '$.a == \'"\'').should.equal(true);
    evaluate({ a: '\'a\'' }, '$.a == "\'a\'" && $.a != "a"').should.equal(true);
  });
});
