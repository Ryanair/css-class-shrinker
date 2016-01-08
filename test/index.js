import test from 'tape';
import cssClassShrinker from '../src';

test('cssClassShrinker', (t) => {
  t.plan(1);
  t.equal(true, cssClassShrinker(), 'return true');
});
