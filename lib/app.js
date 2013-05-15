var path = require('path');
var express = require('express');
var nunjucks = require('nunjucks');
var flash = require('connect-flash');
var clientSessions = require('client-sessions');
var definePersonaRoutes = require('express-persona');

var api = require('./api');
var website = require('./website');

function contentSecurityPolicy(req, res, next) {
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
  app.locals.themeUrl = options.themeUrl;
  app.configure(function() {
    var csrf = express.csrf();
    var apiAuth = options.apiKey
                    ? express.basicAuth('api', options.apiKey)
                    : function(req, res, next) {
                        res.send(403, 'API access is disabled.');
                      };

    app.use(contentSecurityPolicy);
    app.use(express.static(staticDir));
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
