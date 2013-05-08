var path = require('path');
var express = require('express');
var nunjucks = require('nunjucks');
var flash = require('connect-flash');
var definePersonaRoutes = require('express-persona');

function setResponseLocalsForTemplates(req, res, next) {
  res.locals.csrfToken = req.session._csrf;
  res.locals.email = req.session.email;
  next();
}

exports.build = function(options) {
  var app = express();
  var viewsDir = path.join(__dirname, '..', 'views');
  var staticDir = path.join(__dirname, '..', 'static');
  var loader = new nunjucks.FileSystemLoader(viewsDir);
  var env = new nunjucks.Environment(loader, {
    autoescape: true
  });

  env.express(app);
  app.nunjucksEnv = env;
  app.locals.dot_min = options.debug ? '' : '.min';
  app.configure(function() {
    app.use(express.static(staticDir));
    app.use(express.bodyParser());
    app.use(express.cookieParser(options.cookieSecret));
    app.use(express.session({cookie: {maxAge: 60000}}));
    app.use(express.csrf());
    app.use(flash());
    app.use(setResponseLocalsForTemplates);
  });

  app.get('/', function(req, res) {
    res.render('index.html');
  });

  definePersonaRoutes(app, {
    audience: options.personaAudience
  });

  return app;
};
