import BaseShrinker from './base-shrinker';
import esprima from 'esprima';
import query from 'esquery';
import codegen from 'escodegen';
import { namedTypes as t } from 'ast-types';

const CALL_EXPRESSIONS = [
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

const CALL_EXPRESSIONS_WITH_SELECTORS = [
  'querySelector',
  'querySelectorAll',
  'find',
  '$',
  'jQuery'
];

const VARIABLE_CALL_EXPRESSIONS = [
  'setAttribute',
  'attr'
];

const ASSIGNMENT_KEYS = ['className'];

const CLASS_RE = /\.([a-zA-Z\-]+)/g;

// AST Query builders
function buildAssignmentPropExpr(key) {
  return `AssignmentExpression[left.property.name="${key}"]`;
}

function buildAssignmentExpr(key) {
  return `AssignmentExpression[left.name="${key}"]`;
}

function buildVarDeclarator(key) {
  return `VariableDeclarator[init][id.name="${key}"]`;
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

    this.shrinkAssignments(ast, ASSIGNMENT_KEYS);
    this.shrinkCallExpressions(ast, CALL_EXPRESSIONS);
    this.shrinkVariableCallExpressions(ast, VARIABLE_CALL_EXPRESSIONS);
    this.shrinkSelectors(ast, CALL_EXPRESSIONS_WITH_SELECTORS);

    return codegen.generate(ast);
  }

  shrinkAssignments(ast, keys) {
    keys.map(key => query.query(ast, buildAssignmentPropExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => node.right)
        .forEach(node => {
          if (t.Identifier.check(node.right)) {
            this._findAndShrinkVars(ast, node.right.name, 'class');
          } else if (node.right.value) {
            node.right.value = this._shrinkSimpleClass(node.right.value);
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkCallExpressions(ast, keys) {
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => node.arguments.length)
        .forEach(node => {
          node.arguments.forEach(arg => {
            if (t.Identifier.check(arg)) {
              this._findAndShrinkVars(ast, arg.name, 'class');
            } else if (arg.value) {
              arg.value = this._shrinkSimpleClass(arg.value);
            }
          });
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkVariableCallExpressions(ast, keys) {
    let arg;
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => {
          return query.query(node, buildArgumentExpr(0, 'class')).length &&
              node.arguments.length === 2;
        })
        .forEach(node => {
          arg = node.arguments[1];
          if (t.Identifier.check(arg)) {
            this._findAndShrinkVars(ast, arg.name, 'class');
          } else if (arg.value) {
            arg.value = this._shrinkSimpleClass(arg.value);
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkInterpolations() {

  }

  shrinkSelectors(ast, keys) {
    keys.map(key => query.query(ast, buildSelectorCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => node.arguments.length)
        .forEach(node => {
          if (t.Identifier.check(node.arguments[0])) {
            this._findAndShrinkVars(ast, node.arguments[0].name, 'selector');
          } else if (node.arguments[0].value) {
            node.arguments[0].value = this._shrinkSelectors(node.arguments[0].value);
          }
        });
    // console.log('ast', codegen.generate(ast))
  }

  shrinkNgClass(jsString) {
    let ast = esprima.parse(jsString);

    VARIABLE_CALL_EXPRESSIONS.map(key => query.query(ast, buildCallExpr(key)))
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

  _findAndShrinkVars(ast, varName, type) {
    // NOTE: very risky at the moment, since it searches for all occurencies of
    // `varName` in the file and replaces its string contents.
    // TODO: improve this by taking into account function scopes, to limit the
    // risk of changing a variable which shouldn't be touched.
    let shrink = type === 'selector'
        ? this._shrinkSelectors.bind(this)
        : this._shrinkSimpleClass.bind(this);
    query.query(ast, buildVarDeclarator(varName)).forEach(node => {
      if (t.Literal.check(node.init)) {
        node.init.value = shrink(node.init.value);
      }
    });
    query.query(ast, buildAssignmentExpr(varName)).forEach(node => {
      if (t.Literal.check(node.right)) {
        node.right.value = shrink(node.right.value);
      }
    });
  }

  _shrinkSimpleClass(cls) {
    return cls.split(' ')
        .map(c => this.getId(c))
        .join(' ');
  }

  _shrinkSelectors(cls) {
    return cls.replace(CLASS_RE, (m, g) => `.${this.getId(g)}`);
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
