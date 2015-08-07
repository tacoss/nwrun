'use strict';

var slice = Array.prototype.slice;

var fs = require('fs'),
    path = require('path');

function replaceEnv(value) {
  if (typeof value === 'string') {
    return value.replace(/\$\{(\w+)\}/g, function(match, key) {
      return process.env[key] || match;
    });
  }

  return value;
}

function mergeVars(target) {
  if (!target) {
    target = {};
  }

  slice.call(arguments, 1)
    .forEach(function(source) {
      for (var key in source) {
        var value = source[key];

        if (!Array.isArray(target[key]) && typeof target[key] === 'object') {
          target[key] = mergeVars(target[key], value);
        } else {
          target[key] = replaceEnv(typeof value === 'undefined' ? target[key] : value);
        }
      }
    });

  return target;
}

function copy(obj, keys, filter) {
  var out = {};

  if (!obj) {
    return out;
  }

  keys = Array.isArray(keys) ? keys : [];

  for (var key in obj) {
    if (filter && keys.indexOf(key) > -1) {
      out[key] = obj[key];
    }

    if (!filter && keys.indexOf(key) === -1) {
      out[key] = obj[key];
    }
  }

  return out;
}

module.exports = {
  cwd: function(file) {
    return path.join(process.cwd(), file);
  },

  json: function(file) {
    return JSON.parse(fs.readFileSync(file));
  },

  pick: function(obj, props) {
    return copy(obj, props, true);
  },

  omit: function(obj, props) {
    return copy(obj, props);
  },

  exists: function(file) {
    return fs.existsSync(file);
  },

  resolve: function(file) {
    return path.resolve(file);
  },

  mergeVars: mergeVars,
  replaceEnv: replaceEnv
};
