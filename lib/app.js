var path = require('path');
var express = require('express');
var nunjucks = require('nunjucks');
var flash = require('connect-flash');

exports.build = function(options) {
  var app = express();
  var viewsDir = path.join(__dirname, '..', 'views');
  var loader = new nunjucks.FileSystemLoader(viewsDir);
  var env = new nunjucks.Environment(loader, {
    autoescape: true
  });

  env.express(app);
  app.nunjucksEnv = env;
  app.configure(function() {
    app.use(express.cookieParser(options.cookieSecret));
    app.use(express.session({cookie: {maxAge: 60000}}));
    app.use(flash());
  });

  app.get('/', function(req, res) {
    res.render('index.html');
  });

  return app;
};
