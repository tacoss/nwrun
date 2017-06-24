'use strict';

const $ = require('./functions');

const spawn = require('./spawn');

module.exports = (config, callback) => {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }

  const defaults = {
    // CLI argvs
    argv: {},
    force: false,
    target: 'default',
    // runner setup
    jar_url: 'http://selenium-release.storage.googleapis.com/{x}.{y}/selenium-server-standalone-{x}.{y}.{z}.jar',
    jar_path: null,
    jar_version: '2.47.1',
    verbose: false,
    standalone: false,
    // nightwatch-settings
    src_folders: ['tests'],
    output_folder: 'reports',
    // custom settings per-target
    test_settings: {
      default: {
        silent: true,
        output: true,
      },
    },
  };

  const settingsJSON = $.cwd('nightwatch.json');

  const taskOpts = [
    'argv', 'force', 'target', 'verbose', 'standalone', 'jar_path', 'jar_url', 'jar_version',
  ];

  const rootOpts = [
    'src_folders', 'output_folder', 'custom_commands_path', 'custom_assertions_path',
    'page_objects_path', 'globals_path', 'selenium', 'test_settings', 'test_workers', 'test_runner',
    'disable_colors', 'parallel_process_delay',
  ];

  const paths = [
    'src_folders', 'output_folder', 'globals_path', 'custom_commands_path', 'custom_assertions_path',
    'webdriver.firefox.profile', 'phantomjs.binary.path',
    'webdriver.chrome.driver', 'webdriver.ie.driver',
    'exclude', 'filter', 'page_objects_path',
    'path', 'server_path', 'log_path',
  ];

  // use default options first!
  const settings = $.mergeVars({}, $.pick(defaults, rootOpts));
  const options = $.mergeVars({}, $.pick(defaults, taskOpts));

  // load settings/options from custom .json files
  function appendVars(obj) {
    $.mergeVars(settings, $.pick(obj, rootOpts));
    $.mergeVars(options, $.pick(obj, taskOpts));

    if (obj && obj.config_path) {
      const file = $.resolve(obj.config_path);
      const data = file.indexOf('.json') === -1 ? require(file) : $.json(file);

      $.expandPaths(file, data, paths);

      delete obj.config_path;

      appendVars(data);
    }
  }

  // load nightwatch.json file
  if ($.exists(settingsJSON)) {
    $.mergeVars(settings, $.json(settingsJSON));
  }

  if (!settings.selenium) {
    settings.selenium = {};
  }

  // extend settings using task and target options
  appendVars(config);

  // normalize targets
  if (!Array.isArray(options.target)) {
    options.target = [options.target];
  }

  // override options/settings per target, in order
  options.target.forEach(key => {
    appendVars(settings.test_settings[key]);
  });

  ['standalone', 'target', 'force'].forEach(key => {
    if (options.argv[key]) {
      options[key] = options.argv[key];
    }
  });

  spawn(options, settings, callback);
};
