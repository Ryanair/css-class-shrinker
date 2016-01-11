import fs from 'fs';
import path from 'path';
import ncp from 'ncp';
import rimraf from 'rimraf';

export function read(file) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
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
