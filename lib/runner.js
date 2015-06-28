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
    argv: [],
    force: false,
    target: ['default'],
    // runner setup
    jar_url: 'http://selenium-release.storage.googleapis.com/{x}.{y}/selenium-server-standalone-{x}.{y}.{z}.jar',
    jar_path: null,
    jar_version: '2.45.0',
    standalone: false,
    config_path: null,
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
    'argv', 'force', 'target', 'standalone', 'jar_path', 'jar_url', 'jar_version', 'config_path'
  ];

  var settings_opts = [
    'src_folders', 'output_folder', 'custom_commands_path', 'custom_assertions_path',
    'log_screenshot_data', 'use_xpath', 'cli_args', 'end_session_on_fail',
    'silent', 'output', 'screenshots', 'globals', 'exclude', 'filter',
    'page_objects_path', 'globals_path', 'selenium', 'test_settings',
    'live_output', 'disable_colors', 'parallel_process_delay',
    'launch_url', 'selenium_host', 'selenium_port',
    'username', 'access_key',
    'desiredCapabilities'
  ];

  var paths = [
    'src_folders', 'output_folder', 'globals_path', 'custom_commands_path', 'custom_assertions_path',
    'webdriver.ie.driver', 'webdriver.chrome.driver',
    'exclude', 'filter', 'page_objects_path',
    'path', 'server_path', 'log_path'
  ];

  // use default options first!
  var settings = $.mergeVars({}, $.pick(defaults, settings_opts)),
      options = $.mergeVars({}, $.pick(defaults, fake_opts));

  // load nightwatch.json file
  if ($.exists(settings_json)) {
    $.mergeVars(settings, $.json(settings_json));
  }

  if (!settings.selenium) {
    settings.selenium = {};
  }

  // extend settings using task and target options
  $.mergeVars(settings, $.pick(config, settings_opts));
  $.mergeVars(options, $.pick(config, fake_opts));

  // load settings/options from custom .json file
  if (options.config_path) {
    var file  = $.resolve(options.config_path),
        data = $.json(file);

    $.mergeVars(settings, $.pick(data, settings_opts));
    $.mergeVars(options, $.pick(data, fake_opts));

    $.expandPaths(file, settings, paths);
  }

  // create test_settings group if missing
  if (!settings.test_settings) {
    settings.test_settings = {};
  }

  // load the target options with the global and target defaults
  options.target.forEach(function(name) {
    // override task-options (top -> bottom)
    $.mergeVars(options, $.pick(settings.test_settings[name] || {}, fake_opts));

    // load settings/options from custom .json files in targets
    var config_path = (settings.test_settings[name] || {}).config_path;

    if (config_path) {
      // relativize files from config_path
      var file  = $.resolve(config_path),
          data = $.json(file);

      $.mergeVars(settings, $.pick(data, settings_opts));
      $.mergeVars(options, $.pick(data, fake_opts));

      $.expandPaths(file, settings, paths);
    }
  });

  spawn(options, settings, callback);
};
