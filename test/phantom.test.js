var http = require('http');
var app = http.createServer(require('../').app.build({
      debug: 'true',
      cookieSecret: 'testing',
      // We're not putting the port in here, but technically that
      // shouldn't cause any of what we're doing to fail.
      personaAudience: 'http://localhost'
    }));
var spawn = require('child_process').spawn;

const PHANTOMJS = 'phantomjs' || process.env['PHANTOMJS'];
const PHANTOMJS_NOT_FOUND_ERR = 
  'phantomjs not found. please install it from ' +
  'http://phantomjs.org/, or set the ' +
  'PHANTOMJS environment variable to its absolute path.';

var logMessages = [];

function log(msg) {
  logMessages.push(msg);
}

function loggedSpawn(command, args, options) {
  var process = spawn(command, args, options);
  process.stdout.setEncoding('utf8');
  process.stderr.setEncoding('utf8');
  process.stdout.on('data', log);
  process.stderr.on('data', log);
  return process;
}

function start(path, cb) {
  logMessages = [];
  app.listen(0, function() {
    var url = 'http://localhost:' + app.address().port + path;
    var args = [__dirname + '/phantom-qunit.js', url];
    var cmdline = PHANTOMJS + ' ' + args.join(' ');
    var phantom = loggedSpawn(PHANTOMJS, args);

    log('running browser-based tests at ' + url + ' using phantomjs.');
    phantom.on('exit', function(status) {
      app.close();
      if (status != 0) {
        throw new Error('process "' + cmdline + '" exited with status ' +
                        status + '\nOutput:\n' + logMessages.join(''));
      }
      if (cb) cb();
    });
  });
}

function runQunitTests(path, cb) {
  if ('PHANTOMJS' in process.env)
    start(path, cb);
  else
    spawn('which', [PHANTOMJS]).on('exit', function(status) {
      if (status) throw new Error(PHANTOMJS_NOT_FOUND_ERR);
      start(path, cb);
    });
};

describe('QUnit Tests (via PhantomJS)', function() {
  this.timeout(15000);

  it('should not fail', function(done) {
    runQunitTests('/test/', function() {
      done();
    });
  });
});
