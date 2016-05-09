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
    verbose: false,
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

  var task_opts = [
    'argv', 'force', 'target', 'verbose', 'standalone', 'jar_path', 'jar_url', 'jar_version'
  ];

  var root_opts = [
    'src_folders', 'output_folder', 'custom_commands_path', 'custom_assertions_path',
    'page_objects_path', 'globals_path', 'selenium', 'test_settings', 'test_workers', 'test_runner',
    'disable_colors', 'parallel_process_delay'
  ];

  var paths = [
    'src_folders', 'output_folder', 'globals_path', 'custom_commands_path', 'custom_assertions_path',
    'webdriver.firefox.profile', 'phantomjs.binary.path',
    'webdriver.chrome.driver', 'webdriver.ie.driver',
    'exclude', 'filter', 'page_objects_path',
    'path', 'server_path', 'log_path'
  ];

  // use default options first!
  var settings = $.mergeVars({}, $.pick(defaults, root_opts)),
      options = $.mergeVars({}, $.pick(defaults, task_opts));

  // load settings/options from custom .json files
  function appendVars(obj) {
    $.mergeVars(settings, $.pick(obj, root_opts));
    $.mergeVars(options, $.pick(obj, task_opts));

    if (obj && obj.config_path) {
      var file  = $.resolve(obj.config_path),
          data = $.json(file);

      $.expandPaths(file, data, paths);

      delete obj.config_path;

      appendVars(data);
    }
  }

  // load nightwatch.json file
  if ($.exists(settings_json)) {
    $.mergeVars(settings, $.json(settings_json));
  }

  if (!settings.selenium) {
    settings.selenium = {};
  }

  // extend settings using task and target options
  appendVars(config);

  // normalize targets
  if (!Array.isArray(options.target))  {
    options.target = [options.target];
  }

  // override options/settings per target, in order
  options.target.forEach(function(key) {
    appendVars(settings.test_settings[key]);
  });

  ['standalone', 'target', 'force'].forEach(function(key) {
    if (options.argv[key]) {
      options[key] = options.argv[key];
    }
  });

  spawn(options, settings, callback);
};
