var request = require('supertest');
var async = require('async');

var db = require('./db');
var utils = require('./utils');
var data = require('./data');
var models = require('../').models;

db.init();

describe('Website', function() {
  var loggedInEmail = null;
  var app = utils.buildApp({
    defineExtraRoutes: function(app) {
      app.get('/test-make-flash-message', function(req, res) {
        req.flash('info', '<em>hi</em>');
        return res.render('layout.html');
      });
    },
    defineExtraMiddleware: function(app) {
      app.use(function(req, res, next) {
        req.session.email = loggedInEmail;
        next();
      });
    }
  });

  it('should return 200 OK with HTML at /', function(done) {
    loggedInEmail = null;
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });

  it('should return 200 OK with HTML at /demo', function(done) {
    loggedInEmail = null;
    request(app)
      .get('/demo')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });

  it('should show "nothing to review" in queue', function(done) {
    loggedInEmail = "meh@glorb.org";
    async.series([
      db.removeAll(models.Mentor),
      function(done) {
        request(app)
          .get('/')
          .expect(/nothing to review/, done);
      }
    ], done);
  });

  it('should list items to review in queue', function(done) {
    loggedInEmail = "a@b.com";
    async.series([
      db.removeAll(models.Mentor),
      db.removeAll(models.Submission),
      db.create(models.Mentor, {email: "a@b.com", classifications: ["math"]}),
      db.create(models.Submission, data.baseSubmission()),
      function(done) {
        request(app)
          .get('/')
          .expect(/Tropical Koala/, done);
      }
    ], done);
  });

  it('should show email when logged in', function(done) {
    loggedInEmail = "meh@glorb.org";
    request(app)
      .get('/')
      .expect(/meh@glorb\.org/, done);
  });

  it('should show flash messages', function(done) {
    loggedInEmail = null;
    request(app)
      .get('/test-make-flash-message')
      .expect(/class="alert alert-info"/)
      .expect(/<em>hi<\/em>/)
      .expect(200, done);
  });

  it('should include CSRF tokens in pages', function(done) {
    loggedInEmail = null;
    request(app)
      .get('/')
      .expect(/name="csrf" content="[A-Za-z0-9\-_]+"/)
      .expect(200, done);
  });
});
