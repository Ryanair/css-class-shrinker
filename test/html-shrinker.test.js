import test from 'ava';
import 'babel-core/register';
import HtmlShrinker from '../src/shrinkers/html-shrinker';
import { read, copy, clean } from './helpers/helpers';

const map = new Map();
map.set('aaa-ooo', 'dFW');
map.set('eee', 'lpdD');
map.set('iii', 'fsG');
map.set('ooo', 'acvD');
map.set('uuu', 'gDs');
map.set('qqq', 'Hst');

test('HtmlShrinker .shrink()', (t) => {
  t.plan(4);

  const shrinker = new HtmlShrinker('', map);

  t.same(read('expected/html/simple.html'),
      shrinker.shrink(read('fixtures/html/simple.html')),
      'Should shrink a class correctly.');

  t.same(read('expected/html/many-elements.html'),
      shrinker.shrink(read('fixtures/html/many-elements.html')),
      'Should shrink any class of any element correctly.');

  t.same(read('expected/html/multi-classes.html'),
      shrinker.shrink(read('fixtures/html/multi-classes.html')),
      'Should shrink multiple classes of each element correctly.');

  t.same(read('expected/html/partially-similar.html'),
      shrinker.shrink(read('fixtures/html/partially-similar.html')),
      'Should not shrink classes which are similar but not equal to the mapped ones.');
});

test('HtmlShrinker .shrinkNgClass()', (t) => {
  t.plan(4);

  const shrinker = new HtmlShrinker('', map);

  t.same(read('expected/html/ng-simple.html'),
      shrinker.shrinkNgClass(read('fixtures/html/ng-simple.html')),
      'Should shrink an ng-class correctly.');

  t.same(read('expected/html/ng-many-elements.html'),
      shrinker.shrinkNgClass(read('fixtures/html/ng-many-elements.html')),
      'Should shrink any ng-class of any element correctly.');

  t.same(read('expected/html/ng-multi-classes.html'),
      shrinker.shrinkNgClass(read('fixtures/html/ng-multi-classes.html')),
      'Should shrink multiple ng-classes of each element correctly.');

  t.same(read('expected/html/ng-partially-similar.html'),
      shrinker.shrinkNgClass(read('fixtures/html/ng-partially-similar.html')),
      'Should not shrink ng-classes which are similar but not equal to the mapped ones.');
});

test('HtmlShrinker full run', async (t) => {
  t.plan(4);

  const src = 'fixtures/html/full-run';
  const tmp = 'fixtures/html/.full-run';
  await copy(src, tmp);

  const shrinker = new HtmlShrinker(`${tmp}/**/*`, map);
  await shrinker.run();

  t.same(read(`${tmp}/a.html`),
      shrinker.shrinkNgClass(read('expected/html/full-run/a.html')),
      'a.html passed');
  t.same(read(`${tmp}/b.html`),
      shrinker.shrinkNgClass(read('expected/html/full-run/b.html')),
      'b.html passed');
  t.same(read(`${tmp}/c.html`),
      shrinker.shrinkNgClass(read('expected/html/full-run/c.html')),
      'c.html passed');
  t.same(read(`${tmp}/d.html`),
      shrinker.shrinkNgClass(read('expected/html/full-run/d.html')),
      'd.html passed');
  await clean(tmp);
});
