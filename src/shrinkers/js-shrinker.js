import BaseShrinker from './base-shrinker';
import esprima from 'esprima';
import query from 'esquery';
import codegen from 'escodegen';
import { namedTypes as t } from 'ast-types';

// NOTE: polyfilling Array.prototype.find/findIndex for Node 0.12
import 'array.prototype.find';
import 'array.prototype.findindex';

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

function buildSpecificCallExpr(key, argIdx) {
  return `CallExpression[callee.name="${key}"][arguments.${argIdx}]`;
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
        .filter(node => {
          if (t.Identifier.check(node.right)) {
            if (this._findAndShrinkFunctionParams(ast, 'class', node, node.right.name)) {
              return false;
            }
            this._findAndShrinkVars(ast, node, node.right.name, 'class');
            return false;
          }
          return true;
        }).forEach(node => {
          if (node.right.value) {
            node.right.value = this._shrinkSimpleClass(node.right.value);
          }
        });
  }

  shrinkCallExpressions(ast, keys) {
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => node.arguments.length)
        .forEach(node => {
          node.arguments.filter(arg => {
            if (t.Identifier.check(arg)) {
              if (this._findAndShrinkFunctionParams(ast, 'class', node, arg.name)) {
                return false;
              }
              this._findAndShrinkVars(ast, node, arg.name, 'class');
              return false;
            }
            return true;
          }).forEach(arg => {
            if (arg.value) {
              arg.value = this._shrinkSimpleClass(arg.value);
            }
          });
        });
  }

  shrinkSpecificCallExpression(ast, key, argIdx, type) {
    let arg;
    query.query(ast, buildSpecificCallExpr(key, argIdx))
        .filter(node => {
          arg = node.arguments[argIdx];
          if (t.Identifier.check(arg)) {
            if (this._findAndShrinkFunctionParams(ast, type, node, arg.name)) {
              return false;
            }
            this._findAndShrinkVars(ast, node, arg.name, type);
            return false;
          }
          return true;
        }).forEach(node => {
          arg = node.arguments[argIdx];
          if (arg.value) {
            if (type === 'class') {
              arg.value = this._shrinkSimpleClass(arg.value);
            } else {
              arg.value = this._shrinkSelectors(arg.value);
            }
          }
        });
  }

  shrinkVariableCallExpressions(ast, keys) {
    let arg;
    keys.map(key => query.query(ast, buildCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => {
          return query.query(node, buildArgumentExpr(0, 'class')).length &&
              node.arguments.length === 2;
        })
        .filter(node => {
          arg = node.arguments[1];
          if (t.Identifier.check(arg)) {
            if (this._findAndShrinkFunctionParams(ast, 'class', node, arg.name)) {
              return false;
            }
            this._findAndShrinkVars(ast, node, arg.name, 'class');
            return false;
          }
          return true;
        }).forEach(node => {
          arg = node.arguments[1];
          if (arg.value) {
            arg.value = this._shrinkSimpleClass(arg.value);
          }
        });
  }

  shrinkInterpolations() {

  }

  shrinkSelectors(ast, keys) {
    keys.map(key => query.query(ast, buildSelectorCallExpr(key)))
        .reduce((arr, next) => arr.concat(next), [])
        .filter(node => node.arguments.length)
        .filter(node => {
          if (t.Identifier.check(node.arguments[0])) {
            if (this._findAndShrinkFunctionParams(ast, 'selector', node, node.arguments[0].name)) {
              return false;
            }
            this._findAndShrinkVars(ast, node, node.arguments[0].name, 'selector');
            return false;
          }
          return true;
        }).forEach(node => {
          if (node.arguments[0].value) {
            node.arguments[0].value = this._shrinkSelectors(node.arguments[0].value);
          }
        });
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

  _findAndShrinkVars(ast, node, varName, type) {
    // NOTE: very risky at the moment, since it searches for all occurencies of
    // `varName` in the file and replaces its string contents.
    let found = false;
    let shrinkFn = type === 'selector'
        ? this._shrinkSelectors.bind(this)
        : this._shrinkSimpleClass.bind(this);
    let scopeBlock = this._getParentBlockStatement(ast, node);

    while (scopeBlock && !found) {
      found = this._shrinkVariables(scopeBlock, varName, shrinkFn);
      scopeBlock = this._getParentBlockStatement(ast, scopeBlock);
    }
    return found;
  }

  _shrinkVariables(block, name, shrinkFn) {
    let found = false;
    query.query(block, buildVarDeclarator(name)).forEach(varDecl => {
      if (t.Literal.check(varDecl.init)) {
        varDecl.init.value = shrinkFn(varDecl.init.value);
        found = true;
      }
    });
    query.query(block, buildAssignmentExpr(name)).forEach(expr => {
      if (t.Literal.check(expr.right)) {
        expr.right.value = shrinkFn(expr.right.value);
        found = true;
      }
    });
    return found;
  }

  _findAndShrinkFunctionParams(ast, type, node, id) {
    let [scopeFn, argIdx] = this._findFunctionWithParam(ast, node, id);
    if (~argIdx) {
      // NOTE: the variable is declared outside this function and passed in as
      // a parameter
      let fnName = scopeFn.id
          ? scopeFn.id.name
          : this._findFunctionName(ast, scopeFn);
      this.shrinkSpecificCallExpression(ast, fnName, argIdx, type);
      return true;
    }
    return false;
  }

  _findFunctionWithParam(ast, node, argId) {
    let affectedNode = query.query(ast, 'ExpressionStatement')
        .find(block => block.expression === node);
    let scopeFn = query.query(ast, ':function').find(func => {
      return ~func.body.body.indexOf(affectedNode);
    });
    let argIdx = scopeFn.params.findIndex(p => p.name === argId);
    while (scopeFn && !~argIdx) {
      [scopeFn, argIdx] = this._functionLookup(ast, scopeFn, argId);
    }
    return [scopeFn, argIdx];
  }

  _functionLookup(ast, node, id) {
    let idx = -1;
    let scopeFn = query.query(ast, ':function').find(fn => {
      return fn.body.body.find(n => this._hasBlockStatement(n, node.body));
    });
    if (scopeFn) {
      idx = scopeFn.params.findIndex(p => p.name === id);
    }
    return [scopeFn, idx];
  }

  _getParentBlockStatement(ast, node) {
    if (t.BlockStatement.check(node)) {
      return query.query(ast, 'BlockStatement').find(block => {
        return block.body.find(n => this._hasBlockStatement(n, node));
      });
    }
    let affectedNode = query.query(ast, 'ExpressionStatement')
        .find(exprStat => exprStat.expression === node);
    return query.query(ast, 'BlockStatement').find(block => {
      return ~block.body.indexOf(affectedNode);
    });
  }

  _hasBlockStatement(node, block) {
    if (t.FunctionDeclaration.check(node)) {
      return node.body === block;
    }
    if (t.VariableDeclaration.check(node)) {
      return node.declarations.find(d => {
        return t.FunctionExpression.check(d.init) && d.init.body === block;
      });
    }
    if (t.ExpressionStatement.check(node)) {
      if (t.FunctionExpression.check(node.expression.right)) {
        return node.expression.right.body === block;
      } else if (t.CallExpression.check(node.expression)) {
        return node.expression.callee.body === block;
      }
    }
    return false;
  }

  _findFunctionName(ast, fnExpr) {
    let node = query.query(ast, 'VariableDeclarator[init.type="FunctionExpression"]')
        .concat(query.query(ast, 'AssignmentExpression[right.type="FunctionExpression"]'))
        .find(block => block.init === fnExpr || block.right === fnExpr);

    // TODO: handle anonymous functions if needed
    /* istanbul ignore if */
    if (!node) {
      // NOTE: may be an IIFE ?
    }
    return node.id ? node.id.name : node.left.name;
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
