#!/usr/bin/env node

var fs = require('fs');
var url = require('url');
var assert = require('assert');
var mongoose = require('mongoose');

const PORT = process.env['PORT'] || 3000;
const COOKIE_SECRET = process.env['COOKIE_SECRET'] || null;
const MONGO_URL = process.env['MONGO_URL'] || process.env['MONGOHQ_URL'] ||
  process.env['MONGOLAB_URI'] || 'mongodb://localhost/aestimia';
const DEBUG = ('DEBUG' in process.env);
const ENABLE_STUBBYID = ('ENABLE_STUBBYID' in process.env);
const API_SECRET = process.env['API_SECRET'];
const THEME_DIR = 'theme/csol';
const SSL_KEY = process.env['SSL_KEY'];
const SSL_CERT = process.env['SSL_CERT'];
const PERSONA_AUDIENCE = process.env['PERSONA_AUDIENCE'] || (DEBUG
  ? (SSL_KEY ? 'https' : 'http') + '://localhost:' + PORT
  : null);

assert.ok(PERSONA_AUDIENCE, 'PERSONA_AUDIENCE env var should be defined.');
assert.ok(COOKIE_SECRET, 'COOKIE_SECRET env var should be defined.');
assert.ok((SSL_KEY && SSL_CERT) || (!SSL_KEY && !SSL_CERT),
          'if one of SSL_KEY or SSL_CERT is defined, the other must too.');
if (SSL_KEY)
  assert.equal(url.parse(PERSONA_AUDIENCE).protocol, 'https:',
               'PERSONA_AUDIENCE must be https if SSL is enabled.');
if (ENABLE_STUBBYID)
  assert.ok(DEBUG, 'ENABLE_STUBBYID must be used with DEBUG.');

mongoose.connect(MONGO_URL, function(err) {
  if (err) {
    console.error("Error connecting to mongodb instance at " +
                  MONGO_URL + ".\n" + err.stack);
    process.exit(1);
  }

  console.log("Connected to mongodb instance at " + MONGO_URL + ".");
  if (THEME_DIR)
    console.log("Using theme at " + THEME_DIR + ".");

  var app = require('../').app.build({
    cookieSecret: COOKIE_SECRET,
    debug: DEBUG,
    apiKey: API_SECRET,
    themeDir: THEME_DIR,
    personaDefineRoutes: ENABLE_STUBBYID &&
                         require('../test/stubbyid-persona'),
    personaIncludeJs: ENABLE_STUBBYID && '/vendor/stubbyid.js',
    personaAudience: PERSONA_AUDIENCE
  });

  var server = app;

  if (SSL_KEY)
    server = require('https').createServer({
      key: fs.readFileSync(SSL_KEY),
      cert: fs.readFileSync(SSL_CERT)
    }, app);

  server.listen(PORT, function() {
    console.log("API is " + (API_SECRET ? 'enabled' : 'disabled') + ".");
    if (ENABLE_STUBBYID)
      console.log("**   STUBBYID PERSONA SIMULATOR ENABLED   **\n" +
                  "** THIS MEANS USERS CAN LOG IN AS ANYONE! **");
    else
      console.log("Persona audience set to " + PERSONA_AUDIENCE +
                  ".\nSite must be accessed through the above URL, or " +
                  "login will fail.");
    console.log("Listening on port " + PORT + ".");
  });
});
