import BaseShrkinker from './base-shrinker';
import cheerio from 'cheerio';

export default class HtmlShrkinker extends BaseShrkinker {
  constructor(path, map) {
    super(~path.indexOf('.html')
        ? path
        : `${path}.html`,
        map);
  }

  // override
  processFile(contents) {
    return this.shrinkNgClass(this.shrink(contents));
  }

  shrink(htmlString) {
    let $ = cheerio.load(htmlString);
    let classedElements = $('[class]');
    classedElements.each((i, el) => {
      $(el).attr('class',
          $(el).attr('class')
              .split(' ')
              .map(c => this._map.get(c) || c)
              .join(' '));
    });
    return $.html();
  }

  shrinkNgClass(htmlString) {
    // NOTE: it only works with one syntax at the moment:
    // {'class-name': expression }
    // TODO: make sure it only transforms strings present in the classname and
    // not in the expression
    let $ = cheerio.load(htmlString);
    let classedElements = $('[ng-class]');
    let b = 0;
    let e = 0;
    let newCls;
    let cls;
    let c;
    classedElements.each((i, el) => {
      newCls = '';
      cls = $(el).attr('ng-class');
      b = cls.indexOf('\'');
      e = 0;
      while (b !== -1) {
        newCls += cls.substring(e, b+1);
        e = cls.indexOf('\'', b+1);
        c = cls.substring(b+1, e);
        newCls += this._map.get(c) || c;
        b = cls.indexOf('\'', e+1);
      }
      newCls += cls.substring(e, cls.length);
      $(el).attr('ng-class', newCls);
    });
    return $.html().replace(/&apos;/g, '\'');
  }
}
