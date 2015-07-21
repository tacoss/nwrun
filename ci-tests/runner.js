var nwrun = require('../lib/runner'),
    argv =  require('minimist')(process.argv.slice(2));

nwrun({
  argv: argv,
  force: argv.force,
  target: argv.target,
  standalone: argv.standalone,
  src_folders: __dirname + '/tests',
  output_folder: __dirname + '/reports',
  test_settings: {
    saucelabs: {
      desiredCapabilities: {
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      }
    }
  }
}, function(done) {
  if (done === false) {
    process.exit(1);
  }
});
