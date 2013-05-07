var express = require('express');
var flash = require('connect-flash');

exports.build = function(options) {
  var app = express();

  app.configure(function() {
    app.use(express.cookieParser(options.cookieSecret));
    app.use(express.session({cookie: {maxAge: 60000}}));
    app.use(flash());
  });

  app.get('/', function(req, res) {
    res.send('TODO: Put something here.');
  });

  return app;
};
