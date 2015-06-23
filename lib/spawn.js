'use strict';

var $ = require('./functions');

var download = require('./download');

var path = require('path'),
    child_process = require('child_process');

module.exports = function(options, settings, doneCallback) {
  var child;

  process.on('SIGINT', function() {
    if (child) {
      child.kill();
    }
  });

  function spawnNightwatch(done) {
    var data = JSON.stringify({
      argv: $.pick(options.argv, 'tag', 'test', 'filter', 'verbose', 'group', 'skipgroup'),
      group: options.target,
      settings: settings
    });

    var cmd = [path.join(__dirname, 'background.js'), '--', encodeURIComponent(data)];

    if (child) {
      child.kill();
    }

    child = child_process.spawn('node', cmd, {
      stdio: 'inherit'
    }).on('exit', done);
  }

  // nightwatch-runner
  function runTests() {
    if (options.standalone) {
      if (!settings.selenium) {
        settings.selenium = {};
      }

      settings.selenium.start_process = true;
      settings.selenium.server_path = settings.selenium.server_path || options.jar_path;
    }

    spawnNightwatch(doneCallback);
  }

  if (options.standalone) {
    if (options.jar_path && $.exists(options.jar_path)) {
      process.stdout.write('Using Selenium from ' + options.jar_path + '\n');
      runTests();
    } else {
      var v = (options.jar_version || '').split('.'),
          url = options.jar_url.replace(/\{x\}/g, v[0]).replace(/\{y\}/g, v[1]).replace(/\{z\}/g, v[2]),
          jar = options.jar_path || $.cwd(path.basename(url));

      if (!options.force && $.exists(jar)) {
        process.stdout.write('Using already downloaded Selenium from ' + jar + '\n');
        options.jar_path = jar;
        runTests();
      } else {
        process.stdout.write('Selenium is missing and now is downloading. If it fails, run this task using `force` again.' + '\n');
        process.stdout.write('Downloading Selenium from ' + url + ' to ' + jar + '\n');
        process.stdout.write('Please wait ... ' + '\n');

        download(url, jar, function() {
          options.jar_path = jar;
          runTests();
        });
      }
    }
  } else {
    runTests();
  }
};
