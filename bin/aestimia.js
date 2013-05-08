#!/usr/bin/env node

var assert = require('assert');

const PORT = process.env['PORT'] || 3000;
const COOKIE_SECRET = process.env['COOKIE_SECRET'] || null;
const DEBUG = ('DEBUG' in process.env);
const PERSONA_AUDIENCE = process.env['PERSONA_AUDIENCE'] || DEBUG
  ? 'http://localhost:' + PORT
  : null;

assert.ok(PERSONA_AUDIENCE, 'PERSONA_AUDIENCE env var should be defined.');
assert.ok(COOKIE_SECRET, 'COOKIE_SECRET env var should be defined.');

var app = require('../').app.build({
  cookieSecret: COOKIE_SECRET,
  debug: DEBUG,
  personaAudience: PERSONA_AUDIENCE
});

app.listen(PORT, function() {
  console.log("Persona audience set to " + PERSONA_AUDIENCE +
              ".\nSite must be accessed through the above URL, or " +
              "login will fail.");
  console.log("Listening on port " + PORT + ".");
});
