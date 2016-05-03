var $ = require('./functions');

var download = require('./download');

var nightwatch = $.deduct('nightwatch'),
    Module = require('module'),
    path = require('path');

var load = Module._load;

module.exports = function(options, settings, doneCallback) {
  function spawnNightwatch(done) {
    var argv = $.pick(options.argv, ['config', 'env', 'tag', 'test', 'testcase', 'filter', 'verbose',
                   'group', 'skipgroup', 'skiptags', 'output', 'reporter', 'retries', 'suiteRetries']);

    // I found this hack for avoiding intermediate .json files
    var HACK_ID = '__NWRUN_FAKED_CONFIG_BECAUSE_YOLO__' + Math.random();

    argv.config = HACK_ID;
    argv.env = options.target;

    if (Array.isArray(argv.env)) {
      argv.env = argv.env.join(',');
    }

    if (argv.tag) {
      argv.tag = argv.tag.split(',');
    }

    Module._load = function(dir) {
      if (dir.indexOf(HACK_ID) > -1) {
        return settings;
      }

      return load.apply(null, arguments);
    };

    // https://github.com/nightwatchjs/nightwatch/blob/master/lib/index.js
    nightwatch.cli(function(a) {
      Object.keys(argv).forEach(function(key) {
        if (key === 'env' && a['parallel-mode'] === true) {
          return;
        }

        a[key] = argv[key];
      });

      for (var k in a) {
        // try to avoid side-effects from CLI
        if (k.length < 3) {
          delete a[k];
        }
      }

      nightwatch.runner(a, function(success) {
        Module._load = load;
        done(success);
      });
    });
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
    if (options.jar_path && $.exists(options.jar_path) && options.force !== true) {
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
        process.stdout.write('Selenium is missing and now is downloading. If it fails, use the `force` option.' + '\n');
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
