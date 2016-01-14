import fs from 'fs';
import glob from 'glob';

export default class BaseShrkinker {
  constructor(path, map) {
    this._path = path;
    this._map = map;
  }

  async _init(path) {
    this.files = await this.fetchFiles(path);
  }

  async run() {
    await this._init(this._path);
    return Promise.all(this.files.map(async function(file) {
      try {
        return this.write(file, this.processFile(await this.read(file)));
      } catch (e) {
        /* istanbul ignore next */
        console.log(e);
      }
    }.bind(this)));
  }

  getId(key) {
    return this._map.get(key) || key;
  }

  read(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, contents) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          resolve(contents);
        }
      });
    });
  }

  write(file, contents) {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, contents, 'utf8', (err) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  fetchFiles(path) {
    return new Promise((resolve, reject) => {
      fs.lstat(path, (er) => {
        /* istanbul ignore if */
        if (!er) {
          resolve([path]);
        } else {
          glob(path, {}, (err, files) => {
            /* istanbul ignore if */
            if (err) {
              reject(err);
            } else {
              resolve(files);
            }
          });
        }
      });
    });
  }

  // NOTE: must be overridden. Logic left to implementors
  processFile(contents) {
    /* istanbul ignore next */
    console.log(contents);
    return contents;
  }
}
