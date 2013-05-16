var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var express = require('express');
var nunjucks = require('nunjucks');
var flash = require('connect-flash');
var clientSessions = require('client-sessions');
var definePersonaRoutes = require('express-persona');

var api = require('./api');
var website = require('./website');
var filters = require('./filters');
var paths = require('./paths');

function securityHeaders(req, res, next) {
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Content-Type-Options', 'nosniff');

  addContentSecurityPolicy(req, res);
  next();
}

function addContentSecurityPolicy(req, res) {
  var policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "https://login.persona.org"
    ],
    'frame-src': ['https://login.persona.org'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ['*'],
    // options is deprecated, but Firefox still needs it.
    'options': []
  };
  if (req.path == '/test/') {
    // Some of our testing tools, e.g. sinon, use eval(), so we'll
    // enable it for this one endpoint.
    policies['script-src'].push("'unsafe-eval'");
    policies['options'].push('eval-script');
  }
  var directives = [];
  Object.keys(policies).forEach(function(directive) {
    directives.push(directive + ' ' + policies[directive].join(' '));
  });
  var policy = directives.join('; ');
  res.set('Content-Security-Policy', policy);
  res.set('X-Content-Security-Policy', policy);
  res.set('X-WebKit-CSP', policy);
}

function applyTheme(themeDir, app, loaders) {
  themeDir = path.resolve(__dirname, "..", themeDir);

  var appLocalsFile = path.join(themeDir, 'app-locals.json');
  var viewsDir = path.join(themeDir, 'views');
  var staticDir = path.join(themeDir, 'static');

  loaders.push(new nunjucks.FileSystemLoader(viewsDir));
  app.use('/theme/', express.static(staticDir));

  if (fs.existsSync(appLocalsFile))
    _.extend(app.locals, JSON.parse(fs.readFileSync(appLocalsFile, 'utf8')));

  app.locals.THEME_ROOT = '/theme/';
};

exports.build = function(options) {
  var app = express();

  app.configure(function() {
    var env;
    var loaders = [];
    var csrf = express.csrf();
    var apiAuth = options.apiKey
                    ? express.basicAuth('api', options.apiKey)
                    : function(req, res, next) {
                        res.send(403, 'API access is disabled.');
                      };

    app.use(securityHeaders);
    app.use(express.static(paths.staticDir));

    _.extend(app.locals, {
      DOT_MIN: options.debug ? '' : '.min',
      APP_NAME: 'Aestimia'
    });

    if (options.themeDir)
      applyTheme(options.themeDir, app, loaders);

    loaders.push(new nunjucks.FileSystemLoader(paths.viewsDir));
    env = new nunjucks.Environment(loaders, {
      autoescape: true
    });

    env.express(app);
    Object.keys(filters).forEach(function(name) {
      env.addFilter(name, filters[name]);
    });
    app.nunjucksEnv = env;

    app.use(express.bodyParser());
    app.use(clientSessions({
      cookieName: 'session',
      secret: options.cookieSecret,
      duration: 24 * 60 * 60 * 1000, // defaults to 1 day
    }));

    if (options.defineExtraMiddleware) options.defineExtraMiddleware(app);

    app.use(function CsrfOrApiAuth(req, res, next) {
      if (req.path.match(/^\/api\//)) {
        return apiAuth(req, res, next);
      } else
        return csrf(req, res, next);
    });
    app.use(flash());
    app.use(website.setResponseLocalsForTemplates);
  });

  app.param('submissionId', website.findSubmissionById);

  app.get('/', website.index);
  app.get('/history', website.history);
  app.get('/submissions/:submissionId', website.submissionDetail);
  app.post('/submissions/:submissionId', website.submitAssessment);
  app.get('/demo', website.demo);
  app.get('/docs', website.docs);

  definePersonaRoutes(app, {
    audience: options.personaAudience
  });

  app.get('/api/submissions', api.listSubmissions);
  app.post('/api/submission', api.submit);
  app.get('/api/mentors', api.listMentors);
  app.post('/api/mentor', api.changeMentor);

  if (options.defineExtraRoutes) options.defineExtraRoutes(app);

  app.use(function(err, req, res, next) {
    if (typeof(err.status) == 'number')
      return res.type('text/plain').send(err.status, err.message);
    process.stderr.write(err.stack);
    res.send(500, 'Sorry, something exploded!');
  });

  return app;
};
