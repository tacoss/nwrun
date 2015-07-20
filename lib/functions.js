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

module.exports = {
  cwd: function(file) {
    return path.join(process.cwd(), file);
  },

  json: function(file) {
    return JSON.parse(fs.readFileSync(file));
  },

  pick: function(obj, props) {
    var out = {};

    (Array.isArray(props) ? props : slice.call(arguments, 1))
      .forEach(function(prop) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, prop)) {
          out[prop] = obj[prop];
        }
      });

    return out;
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
