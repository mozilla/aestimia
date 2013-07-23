var http = require('http');
var url = require('url');
var assert = require('assert');
var colors = require('colors');
var wd = require('wd');
var mongoose = require('mongoose');

var aestimia = require('../../');
var stubbyIdPersona = require('../../test/stubbyid-persona');
var support = require('../../test/acceptance');
var waitFor = support.waitFor;

var initialized = false;

var CUCUMBER_DEBUG = 'ACCEPTANCE_DEBUG' in process.env;
var CUCUMBER_BROWSER_NAME = process.env.ACCEPTANCE_BROWSER_NAME || 'phantom';
var CUCUMBER_MONGODB_URL = 'mongodb://localhost/test';

process.on('uncaughtException', function(err) {
  console.error(err.stack);
  support.servers.stopAll(function() {
    process.exit(1);
  });
});

process.on('exit', function() {
  support.servers.stopAll(function() {});
});

function removeAllModels() {
  Object.keys(aestimia.models).forEach(function(name) {
    if (typeof(aestimia.models[name].remove) == 'function')
      waitFor(aestimia.models[name], 'remove', {});
  });
}

function showWebdriverDebugOutput(asyncBrowser) {
  asyncBrowser.on('status', function(info) {
    console.info(info.cyan);
  });

  asyncBrowser.on('command', function(meth, path, data) {
    console.info(' > ' + meth.yellow, path.grey, data || '');
  });  
}

module.exports = support.fiberize(function() {
  this.Before(function() {
    var setupStartTime = Date.now();
    var phantom;
    var asyncBrowser;
    var appOptions = {
      cookieSecret: 'cookiesecret',
      apiKey: 'apikey',
      debug: true,
      personaDefineRoutes: stubbyIdPersona,
      personaIncludeJs: '/vendor/stubbyid.js',
      personaAudience: 'http://does-not-matter'
    };
    var app = aestimia.app.build(appOptions);
    var server = http.createServer(app);

    if (CUCUMBER_BROWSER_NAME == 'phantom') {
      phantom = support.Phantom();
      asyncBrowser = phantom.createWebdriver();
    } else {
      asyncBrowser = wd.remote();
    }

    if (CUCUMBER_DEBUG) {
      showWebdriverDebugOutput(asyncBrowser);
    } else {
      console.info = function() {};
    }

    if (!initialized) {
      if (phantom) waitFor(support.servers, 'start', phantom);
      waitFor(mongoose, 'connect', CUCUMBER_MONGODB_URL);
      initialized = true;
    }
    waitFor(asyncBrowser, 'init', {
      browserName: CUCUMBER_BROWSER_NAME
    });
    removeAllModels();
    this.browser = new support.FiberWebdriverObject(asyncBrowser);
    waitFor(server, 'listen');
    this.app = app;
    this.server = server;
    this.options = appOptions;
    this.url = function(path) {
      return url.resolve('http://localhost:' + server.address().port, path);
    };
    this.answerNextPromptWith = function(response) {
      // We need to do this because phantomjs doesn't support
      // window.prompt().
      this.browser.eval("window.prompt = function() { return " +
                        JSON.stringify(response) + "; };");
    };
    this.waitFor = waitFor;
    this._scenarioStartTime = Date.now();
    console.info("Scenario setup completed in " +
                 (this._scenarioStartTime - setupStartTime) + " ms.");
  });

  this.After(function() {
    console.info("Scenario steps completed in " +
                 (Date.now() - this._scenarioStartTime) + " ms.");
    this.browser.quit();
    this.server.close();
  });
});
