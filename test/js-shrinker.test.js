import test from 'ava';
import 'babel-core/register';
import JsShrinker from '../src/shrinkers/js-shrinker';
import { readJs as read, copy, clean } from './helpers/helpers';

const map = new Map();
map.set('some-class', 'sCl');
map.set('other-class', 'oTC');
map.set('yet-another-class', 'YaC');

test('JsShrinker .shrink()', (t) => {
  t.plan(7);

  const shrinker = new JsShrinker('', map);

  t.same(shrinker.shrink(read('fixtures/js/basic-all-places.js')),
      read('expected/js/basic-all-places.js'),
      'Should shrink a class in every possible usage of it correctly.');

  t.same(shrinker.shrink(read('fixtures/js/multiple-classes.js')),
      read('expected/js/multiple-classes.js'),
      'Should shrink multiple classes found in the same expression correctly.');

  t.same(shrinker.shrink(read('fixtures/js/complex-selectors.js')),
      read('expected/js/complex-selectors.js'),
      'Should shrink classes found in complex selectors correctly.');

  t.skip.same(shrinker.shrink(read('fixtures/js/with-function-props.js')),
      read('expected/js/with-function-props.js'),
      'Should shrink classes injected through a function argument correctly.');

  t.skip.same(shrinker.shrink(read('fixtures/js/with-interpolations.js')),
      read('expected/js/with-interpolations.js'),
      'Should shrink classes built with any kind of string interpolation correctly.');

  t.same(shrinker.shrink(read('fixtures/js/with-variables.js')),
      read('expected/js/with-variables.js'),
      'Should shrink classes injected via a local variable correctly.');

  t.same(shrinker.shrink(read('fixtures/js/partially-similar.js')),
      read('expected/js/partially-similar.js'),
      'Should not shrink classes which are similar but not equal to the mapped ones.');
});

test('JsShrinker .shrinkNgClass()', (t) => {
  t.plan(2);

  const shrinker = new JsShrinker('', map);

  t.same(shrinker.shrinkNgClass(read('fixtures/js/ng-basic-all-places.js')),
      read('expected/js/ng-basic-all-places.js'),
      'Should shrink a class in every possible ng-class usage of it correctly.');

  t.skip.same(shrinker.shrinkNgClass(read('fixtures/js/ng-multiple-classes.js')),
      read('expected/js/ng-multiple-classes.js'),
      'Should shrink multiple classes found in the same ng-class expression correctly.');

  // TODO: add fixtures and expectation for this
  // t.skip.same(shrinker.shrinkNgClass(read('fixtures/js/ng-partially-similar.js')),
  //     read('expected/js/ng-partially-similar.js'),
  //     'Should not shrink ng-classes which are similar but not equal to the mapped ones.');
});

// TODO: add fixtures and expectation for this
// test('JsShrinker full run', async (t) => {
//   t.plan(4);
//
//   const src = 'fixtures/js/full-run';
//   const tmp = 'fixtures/js/.full-run';
//   await copy(src, tmp);
//
//   const shrinker = new JsShrinker(`${tmp}/**/*`, map);
//   await shrinker.run();
//
//   t.skip.same(read(`${tmp}/a.js`),
//       shrinker.shrinkNgClass(read('expected/js/full-run/a.js')),
//       'a.js passed');
//   t.skip.same(read(`${tmp}/b.js`),
//       shrinker.shrinkNgClass(read('expected/js/full-run/b.js')),
//       'b.js passed');
//   t.skip.same(read(`${tmp}/c.js`),
//       shrinker.shrinkNgClass(read('expected/js/full-run/c.js')),
//       'c.js passed');
//   t.skip.same(read(`${tmp}/d.js`),
//       shrinker.shrinkNgClass(read('expected/js/full-run/d.js')),
//       'd.js passed');
//   await clean(tmp);
// });
