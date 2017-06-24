'use strict';

const $ = require('./functions');

const download = require('./download');

const nightwatch = require('nightwatch');
const Module = require('module');
const path = require('path');

const load = Module._load;

const _fixedArgv = {
  'paraller-worker': '',
  'test-worker': '',
  config: 'c',
  output: 'o',
  reporter: 'r',
  env: 'e',
  verbose: '',
  test: 't',
  testcase: '',
  group: 'g',
  skipgroup: 's',
  filter: 'f',
  tag: 'a',
  skiptags: '',
  retries: '',
  suiteRetries: '',
  help: 'h',
  version: 'v',
};

module.exports = (options, settings, doneCallback) => {
  function spawnNightwatch(done) {
    const argv = $.pick(options.argv, Object.keys(_fixedArgv));

    // I found this hack for avoiding intermediate .json files
    const HACK_ID = `__NWRUN_FAKED_CONFIG_BECAUSE_YOLO__${Math.random()}`;

    argv.config = HACK_ID;
    argv.env = options.target;

    if (Array.isArray(argv.env)) {
      argv.env = argv.env.join(',');
    }

    if (argv.tag) {
      argv.tag = argv.tag.split(',');
    }

    Module._load = function $load(dir) {
      if (dir.indexOf(HACK_ID) > -1) {
        return settings;
      }

      return load.apply(null, arguments);
    };

    nightwatch.cli(a => {
      Object.keys(_fixedArgv).forEach(key => {
        const short = _fixedArgv[key];

        if (short) {
          argv[short] = argv[key] || options.argv[short] || a[short];
          argv[key] = argv[key] || a[key] || argv[short];
        }
      });

      if (settings.test_workers && settings.test_workers.enabled) {
        delete argv.test;
      }

      nightwatch.runner(argv, (files, err) => {
        if (typeof files === 'object') {
          done(err);
        }

        if (files === true) {
          done(true);
        } else {
          done(files);
        }
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
      process.stdout.write(`Using Selenium from ${options.jar_path}\n`);
      runTests();
    } else {
      const v = (options.jar_version || '').split('.');
      const url = options.jar_url.replace(/\{x\}/g, v[0]).replace(/\{y\}/g, v[1]).replace(/\{z\}/g, v[2]);
      const jar = options.jar_path || $.cwd(path.basename(url));

      if (!options.force && $.exists(jar)) {
        process.stdout.write(`Using already downloaded Selenium from ${jar}\n`);
        options.jar_path = jar;
        runTests();
      } else {
        process.stdout.write("Selenium is missing and now is downloading. If it fails, use the '--force' option.\n");
        process.stdout.write(`Downloading Selenium from ${url} to ${jar}\n`);
        process.stdout.write('Please wait ... \r');

        download(url, jar, err => {
          if (err) {
            throw err;
          }

          options.jar_path = jar;
          runTests();
        });
      }
    }
  } else {
    runTests();
  }
};
