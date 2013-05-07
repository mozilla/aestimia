#!/usr/bin/env node

var assert = require('assert');

const PORT = process.env['PORT'] || 3000;
const COOKIE_SECRET = process.env['COOKIE_SECRET'] || null;

assert.ok(COOKIE_SECRET, 'COOKIE_SECRET env var should be defined.');

var app = require('../').app.build({
  cookieSecret: COOKIE_SECRET
});

app.listen(PORT, function() {
  console.log("Listening on port " + PORT + ".");
});
