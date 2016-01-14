import fs from 'fs';
import path from 'path';
import ncp from 'ncp';
import rimraf from 'rimraf';
import esprima from 'esprima';
import codegen from 'escodegen';

export function read(file) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
}

export function readJs(file) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  return codegen.generate(esprima.parse(source));
}

export function copy(src, dest) {
  return new Promise((resolve, reject) => {
    ncp(src, dest, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function clean(src) {
  return new Promise((resolve, reject) => {
    rimraf(src, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
