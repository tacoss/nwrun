'use strict';

var argv = require('minimist')(process.argv.slice(2));

var runner = require('../lib/runner');

var settings = {};

for (var k in argv._) {
  var v = argv._[k],
      p = v.split(':');

  if (k && v) {
    settings[p[0]] = p[1];
  }
}

delete argv._;

settings.argv = argv;

runner(settings, function(success) {
  console.log('OK', success);

  if (success === false) {
    process.exit(2);
  }
});
