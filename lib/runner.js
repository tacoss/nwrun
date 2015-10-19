'use strict';

var $ = require('./functions');

var spawn = require('./spawn');

module.exports = function(config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }

  var defaults = {
    // CLI argvs
    argv: {},
    force: false,
    target: 'default',
    // runner setup
    jar_url: 'http://selenium-release.storage.googleapis.com/{x}.{y}/selenium-server-standalone-{x}.{y}.{z}.jar',
    jar_path: null,
    jar_version: '2.47.1',
    standalone: false,
    // nightwatch-settings
    src_folders: ['tests'],
    output_folder: 'reports',
    // custom settings per-target
    test_settings: {
      'default': {
        silent: true,
        output: true
      }
    }
  };

  var settings_json = $.cwd('nightwatch.json');

  var fake_opts = [
    'argv', 'force', 'target', 'standalone', 'jar_path', 'jar_url', 'jar_version'
  ];

  var root_opts = [
    'src_folders', 'output_folder', 'custom_commands_path', 'custom_assertions_path', 'page_objects_path', 'globals_path', 'selenium'
  ];

  // use default options first!
  var settings = $.mergeVars({}, $.omit(defaults, fake_opts)),
      options = $.mergeVars({}, $.pick(defaults, fake_opts));

  // load nightwatch.json file
  if ($.exists(settings_json)) {
    $.mergeVars(settings, $.json(settings_json));
  }

  if (!settings.selenium) {
    settings.selenium = {};
  }

  // extend settings using task and target options
  $.mergeVars(settings, $.omit(config, fake_opts));
  $.mergeVars(options, $.pick(config, fake_opts));

  // normalize targets
  if (!Array.isArray(options.target))  {
    options.target = [options.target];
  }

  // override options per target, in order
  options.target.forEach(function(key) {
    $.mergeVars(options, $.pick(settings.test_settings[key], fake_opts));

    // override settings per target, in order, root-only options
    $.mergeVars(settings, $.pick(settings.test_settings[key], root_opts));
  });

  spawn(options, settings, callback);
};
