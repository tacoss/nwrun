[![Build Status](https://travis-ci.org/gextech/nwrun.svg?branch=master)](https://travis-ci.org/gextech/nwrun)

Look ma', without `.json` files:

```javascript
var argv =  require('minimist')(process.argv.slice(2)),
    nwrun = require('nwrun');

nwrun({
  argv: argv,
  force: argv.force,
  target: argv.target,
  standalone: argv.standalone,
  src_folders: process.cwd() + '/tests',
  output_folder: process.cwd() + '/reports'
}, function(success) {
  if (!success) {
    process.exit(1);
  }
});
```

## Why?

This is just a dirty-hack based on `nightwatch.initGrunt()` method due compatibility issues with `grunt-nightwatch` itself.

Unlike other solutions we are not spawning the nightwatch process, instead, we fake its settings in runtime.

Another interesting feature is the downloading of the `selenium-server-standalone*.jar` file.

Is like running nightwatch but programmatically.
