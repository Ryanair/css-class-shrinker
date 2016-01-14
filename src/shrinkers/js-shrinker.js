import BaseShrkinker from './base-shrinker';
import esprima from 'esprima';
import query from 'esquery';

const functionCalls = [
  'classList.add',
  'classList.remove',
  'classList.contains',
  'addClass',
  'removeClass',
  'hasClass',
  'setClass',
  'toggleClass',
  'getElementsByClassName'
];

const functionCallsWithSelectors = [
  'querySelector',
  'querySelectorAll',
  'find',
  '$',
  'jQuery'
];

const variableFunctionCalls = [
  'setAttribute',
  'attr'
];

const assignmentExpr = 'className';

export default class JsShrkinker extends BaseShrkinker {
  // TODO: for each file initilize a new sourcemap or read an existing one
  // TODO: traverse the file searching for strings (use indexOf to traverse it)
  // TODO: replace any occurrences of shrinkable classes with relative ID
  // TODO: update the sourcemap according to the above changes
  constructor(path, map) {
    super(~path.indexOf('.js')
    ? path
    : `${path}.js`,
    map);
  }

  // override
  processFile(contents) {
    return this.shrinkNgClass(this.shrink(contents));
  }

  shrink(jsString) {


    //
    // let classedElements = $('[class]');
    // classedElements.each((i, el) => {
    //   $(el).attr('class',
    //   $(el).attr('class')
    //   .split(' ')
    //   .map(c => this._map.get(c) || c)
    //   .join(' '));
    // });
    return ast.toString();
  }

  shrinkAssignments() {

  }

  shrinkInterpolations() {

  }

  shrinkSelectors(jsString) {
    return jsString;
    // let $ = cheerio.load(jsString);
    // let classedElements = $('[class]');
    // classedElements.each((i, el) => {
    //   $(el).attr('class',
    //   $(el).attr('class')
    //   .split(' ')
    //   .map(c => this._map.get(c) || c)
    //   .join(' '));
    // });
    // return $.html();
  }

  shrinkNgClass(jsString) {
    // NOTE: it only works with one syntax at the moment:
    // {'class-name': expression }
    // TODO: make sure it only transforms strings present in the classname and
    // not in the expression

    return jsString;
    // let $ = cheerio.load(jsString);
    // let classedElements = $('[ng-class]');
    // let b = 0;
    // let e = 0;
    // let newCls;
    // let cls;
    // let c;
    // classedElements.each((i, el) => {
    //   newCls = '';
    //   cls = $(el).attr('ng-class');
    //   b = cls.indexOf('\'');
    //   e = 0;
    //   while (b !== -1) {
    //     newCls += cls.substring(e, b+1);
    //     e = cls.indexOf('\'', b+1);
    //     c = cls.substring(b+1, e);
    //     newCls += this._map.get(c) || c;
    //     b = cls.indexOf('\'', e+1);
    //   }
    //   newCls += cls.substring(e, cls.length);
    //   $(el).attr('ng-class', newCls);
    // });
    // return $.html().replace(/&apos;/g, '\'');
  }
}
