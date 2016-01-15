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
  // TODO: update the sourcemap according to the changes
  // TODO: for angular: fetch all class="{{some.scope.prop}}" during html shrink
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
    this.shrinkVariableCallExpressions(ast, variableCallExpressions);
    this.shrinkSelectors(ast, callExpressionsWithSelectors);

    return codegen.generate(ast);
  }

  shrinkAssignments(ast, keys) {
    keys.map(key => query.query(ast, buildAssignmentExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .forEach(node => {
          if (node.right && node.right.value) {
            node.right.value = node.right.value
                .split(' ')
                .map(c => this.getId(c))
                .join(' ');
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
              if (arg.value) {
                arg.value = arg.value
                  .split(' ')
                  .map(c => this.getId(c))
                  .join(' ');
              }
            });
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkVariableCallExpressions(ast, keys) {
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => query.query(node, buildArgumentExpr(0, 'class')).length)
        .forEach(node => {
          if (node.arguments.length) {
            // NOTE: I'll process the first argument as well, there's no risk
            // that someone will create a class named .class or .ng-class
            node.arguments.forEach(arg => {
              arg.value = arg.value
                  .split(' ')
                  .map(c => this.getId(c))
                  .join(' ');
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
    let ast = esprima.parse(jsString);

    variableCallExpressions.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => query.query(node, buildArgumentExpr(0, 'ng-class')).length)
        .forEach(node => {
          if (node.arguments.length) {
            // NOTE: I'll process the first argument as well, there's no risk
            // that someone will create a class named .class or .ng-class
            node.arguments.forEach(arg => {
              arg.value = this._shrinkNgClass(arg.value);
            });
          }
        });
    return codegen.generate(ast);
  }

  _shrinkNgClass(cls) {
    // NOTE: it only works with one syntax at the moment:
    // {'class-name': expression }
    // TODO: make sure it only transforms strings present in the classname and
    // not in the expression
    let newCls = '';
    let b = cls.indexOf('\'');
    let e = 0;
    let c;
    while (b !== -1) {
      newCls += cls.substring(e, b+1);
      e = cls.indexOf('\'', b+1);
      c = cls.substring(b+1, e);
      newCls += this.getId(c);
      b = cls.indexOf('\'', e+1);
    }
    newCls += cls.substring(e, cls.length);
    return newCls;
  }
}
