'use strict';

const fs = require('fs');
const path = require('path');

function resolvePath(file, dir) {
  return path.resolve(process.cwd(), path.dirname(file), dir);
}

function expandPaths(fromFile, target, paths) {
  Object.keys(target).forEach(key => {
    const item = target[key];

    if (typeof item === 'object' && !Array.isArray(item)) {
      expandPaths(fromFile, item, paths);
    } else if (paths.indexOf(key) > -1) {
      target[key] = Array.isArray(item) ? item.map(folder => {
        return resolvePath(fromFile, folder);
      }) : resolvePath(fromFile, item);
    }
  });
}

function replaceEnv(value) {
  if (typeof value === 'string') {
    return value.replace(/\$\{(\w+)\}/g, (match, key) => {
      return process.env[key] || match;
    });
  }

  return value;
}

function mergeVars(target) {
  if (!target) {
    target = {};
  }

  Array.prototype.slice.call(arguments, 1)
    .forEach(source => {
      Object.keys(source).forEach(key => {
        const value = source[key];

        if (target[key] !== null && !Array.isArray(target[key]) && typeof target[key] === 'object') {
          target[key] = mergeVars(target[key], value);
        } else {
          target[key] = replaceEnv(typeof value === 'undefined' ? target[key] : value);
        }
      });
    });

  return target;
}

function copy(obj, keys, filter) {
  const out = {};

  if (!obj) {
    return out;
  }

  keys = Array.isArray(keys) ? keys : [];

  Object.keys(obj).forEach(key => {
    if (filter && keys.indexOf(key) > -1) {
      out[key] = obj[key];
    }

    if (!filter && keys.indexOf(key) === -1) {
      out[key] = obj[key];
    }
  });

  return out;
}

module.exports = {
  cwd(file) {
    return path.join(process.cwd(), file);
  },

  json(file) {
    return JSON.parse(fs.readFileSync(file));
  },

  pick(obj, props) {
    return copy(obj, props, true);
  },

  omit(obj, props) {
    return copy(obj, props);
  },

  exists(file) {
    return fs.existsSync(file);
  },

  resolve(file) {
    return path.resolve(file);
  },

  mergeVars,
  replaceEnv,
  expandPaths,
};
