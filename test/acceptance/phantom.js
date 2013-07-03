var spawn = require('child_process').spawn;
var wd = require('wd');

var DEFAULT_PORT = 4444;

module.exports = function Phantom(port) {
  var self = {};

  port = port || DEFAULT_PORT;
  self.name = 'phantomjs';
  self.url = 'http://localhost:' + port + '/status';
  self.startServer = function(cb) {
    var subprocess = spawn('phantomjs', ['--webdriver=' + port], {
      stdio: ['ignore', 'ignore', 'ignore']
    });
    subprocess.on('close', function(code) {
      if (code !== 0)
        return cb(new Error("phantomjs exited with code " + code));
      cb(null);
    });
    return subprocess;
  };
  self.createWebdriver = function() {
    return wd.remote("localhost", port);
  };

  return self;
};
