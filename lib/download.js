'use strict';

// download utility
const http = require('http');
const url = require('url');
const fs = require('fs');

// https://github.com/dcodeIO/ClosureCompiler.js/blob/master/scripts/configure.js
module.exports = (downloadUrl, filename, callback) => {
  const URL = url.parse(downloadUrl);

  const out = fs.createWriteStream(filename, {
    flags: 'w',
    encoding: null,
    mode: '0666',
  });

  function fail(e) {
    try {
      // remove corrupted file
      fs.unlinkSync(filename);
    } catch (_e) {
      // do nothing
    }

    callback(e);
  }

  const req = http.request({
    hostname: URL.hostname,
    port: URL.port,
    method: 'GET',
    path: URL.path,
    agent: false,
  }, res => {
    if (res.statusCode !== 200) {
      res.setEncoding(null);
      fail(new Error(`Download failed: HTTP status code ${res.statusCode}`));
      return;
    }

    res.on('end', () => {
      callback();
    });

    res.pipe(out);
  });

  req.on('error', e => {
    fail(e);
  });

  req.end();
};
