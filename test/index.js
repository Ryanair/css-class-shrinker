import test from 'ava';
import 'babel-core/register';
import cssClassShrinker from '../src';

test('cssClassShrinker', (t) => {
  t.plan(1);
  t.same(true, cssClassShrinker(), 'return true');
});
