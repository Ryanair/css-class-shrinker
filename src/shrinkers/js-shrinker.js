import BaseShrinker from './base-shrinker';
import esprima from 'esprima';
import query from 'esquery';
import codegen from 'escodegen';

const callExpressions = [
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

const callExpressionsWithSelectors = [
  'querySelector',
  'querySelectorAll',
  'find',
  '$',
  'jQuery'
];

const variableCallExpressions = [
  'setAttribute',
  'attr'
];

const assignmentKeys = ['className'];

function buildAssignmentExpr(key) {
  return `AssignmentExpression[left.property.name="${key}"]`;
}

function buildArgumentExpr(n, arg) {
  return `[arguments.${n}.value="${arg}"]`;
}

function buildCallExpr(key) {
  if (~key.indexOf('.')) {
    let [obj, meth] = key.split('.');
    return `CallExpression[callee.object.property.name="${obj}"][callee.property.name="${meth}"]`;
  }
  return `CallExpression[callee.property.name="${key}"]`;
}

function buildSelectorCallExpr(key) {
  if (key === '$' || key === 'jQuery') {
    return `CallExpression[callee.name="${key}"][arguments.0.value=/\./]`;
  }
  return `CallExpression[callee.property.name="${key}"][arguments.0.value=/\./]`;
}

export default class JsShrinker extends BaseShrinker {
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
    let ast = esprima.parse(jsString);

    this.shrinkAssignments(ast, assignmentKeys);
    this.shrinkCallExpressions(ast, callExpressions);
    this.shrinkVariableCallExpressions('class', ast, variableCallExpressions);
    this.shrinkSelectors(ast, callExpressionsWithSelectors);

    //
    // let classedElements = $('[class]');
    // classedElements.each((i, el) => {
    //   $(el).attr('class',
    //   $(el).attr('class')
    //   .split(' ')
    //   .map(c => this._map.get(c) || c)
    //   .join(' '));
    // });
    return codegen.generate(ast);
  }

  shrinkAssignments(ast, keys) {
    let val;
    keys.map(key => query.query(ast, buildAssignmentExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .forEach(node => {
          if (node.right && node.right.value) {
            val = node.right.value;
            node.right.value = this.getId(val);
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkCallExpressions(ast, keys) {
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .forEach(node => {
          if (node.arguments.length) {
            node.arguments.forEach(arg => {
              arg.value = this.getId(arg.value);
            });
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkVariableCallExpressions(type, ast, keys) {
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => query.query(node, buildArgumentExpr(0, type)).length)
        .forEach(node => {
          if (node.arguments.length) {
            // NOTE: I'll process the first argument as well, there's no risk
            // that someone will create a class named .class or .ng-class
            node.arguments.forEach(arg => {
              arg.value = this.getId(arg.value);
            });
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkInterpolations() {

  }

  shrinkSelectors(ast, keys) {
    let cls = '';
    keys.map(key => query.query(ast, buildSelectorCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .forEach(node => {
          if (node.arguments.length && node.arguments[0].value) {
            cls = node.arguments[0].value.replace(
                /\.([a-zA-Z\-]+)/g,
                (m, g) => `.${this.getId(g)}`);
            node.arguments[0].value = cls;
          }
        });
    // console.log('ast', codegen.generate(ast))
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
