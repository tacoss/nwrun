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

## API

`nwrun(options, callback)`

**Options**

- `argv` &mdash; main argvs for the nightwatch instance
- `force` &mdash; always force the download of the selenium jar
- `target` &mdash; shortcut for specifying environments ( `--env a,b`)
- `standalone` &mdash; if true will start selenium (will be downloaded if missing)
- `jar_url` &mdash; custom endpoint for the downloading the selenium jar
- `jar_path` &mdash; custom directory for saving the selenium jar locally
- `jar_version` &mdash; custom version for the given `jar_url`, e.g. `2.45.0`
- `config_path` &mdash; custom path for JSON settings and options, it can be overriden per target

When done `callback(success)` will get executed.

If `success` is false means something failed.

Otherwise you're done.

> All other options are passed directly to the `nightwatch.runner()` method.
