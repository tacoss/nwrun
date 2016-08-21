// download utility
var http = require('http'),
  url = require('url'),
  fs = require('fs');

// https://github.com/dcodeIO/ClosureCompiler.js/blob/master/scripts/configure.js
module.exports = function(downloadUrl, filename, callback) {
  var URL = url.parse(downloadUrl);

  var out = fs.createWriteStream(filename, {
      flags: 'w',
      encoding: null,
      mode: '0666'
    }),
    req;

  function fail(e) {
    try {
      // remove corrupted file
      fs.unlinkSync(filename);
    } catch (_e) {}

    callback(e);
  }

  req = http.request({
    hostname: URL.hostname,
    port: URL.port,
    method: 'GET',
    path: URL.path,
    agent: false
  },
  function(res) {
    if (res.statusCode !== 200) {
      res.setEncoding(null);
      fail(new Error('Download failed: HTTP status code ' + res.statusCode));
      return;
    }

    res.on('end', function() {
      callback();
    });

    res.pipe(out);
  });

  req.on('error', function(e) {
    fail(e);
  });

  req.end();
};
