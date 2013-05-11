var request = require('supertest');
var async = require('async');
var sinon = require('sinon');
var should = require('should');

var db = require('./db');
var utils = require('./utils');
var data = require('./data');
var website = require('../').website;
var models = require('../').models;

var loggedInEmail = null;

function setupFixtures(done) {
  loggedInEmail = null;
  async.series([
    db.removeAll(models.Mentor),
    db.removeAll(models.Submission),
    db.create(models.Mentor, {
      email: "a@b.com",
      classifications: ["math"]
    }),
    db.create(models.Submission, data.baseSubmission({
      _id: "a07f1f77bcf86cd799439011"
    }))
  ], done);
}

db.init();

describe('Website', function() {
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
        req.session._csrf = "deadbeef";
        next();
      });
    }
  });

  it('should return 200 OK with HTML at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });

  it('should return 200 OK with HTML at /demo', function(done) {
    request(app)
      .get('/demo')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });

  describe('queue', function() {
    beforeEach(setupFixtures);

    it('should show "nothing to review"', function(done) {
      loggedInEmail = "meh@glorb.org";
      request(app)
        .get('/')
        .expect(/nothing to review/, done);
    });

    it('should list items to review', function(done) {
      loggedInEmail = "a@b.com";
      request(app)
        .get('/')
        .expect(/Tropical Koala/, done);
    });
  });

  it('should pass errors through in findSubmissionById()', function() {
    var next = sinon.spy();
    var err = new Error('some error');
    sinon.stub(models.Submission, 'findOne', function(query, cb) {
      query._id.should.eql('someid');
      cb(err);
    });
    website.findSubmissionById(null, null, next, 'someid');
    models.Submission.findOne.restore();
    next.callCount.should.eql(1);
    next.args[0].length.should.eql(1);
    next.args[0][0].should.equal(err);
  });

  describe('/history', function() {
    beforeEach(setupFixtures);

    it('should return 401 if user is not logged in', function(done) {
      request(app)
        .get('/history')
        .expect(401, done);      
    });

    it('should work', function(done) {
      loggedInEmail = "a@b.com";
      request(app)
        .get('/history')
        .expect(200, done);
    });
  });

  describe('POST /submissions/:submissionId', function() {
    beforeEach(setupFixtures);

    it('should work', function(done) {
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd799439011')
            .send({
              _csrf: 'deadbeef',
              response: 'this is awesome',
              rubric_0: 'on',
              rubric_1: 'on'
            })
            .expect('Location', '/submissions/a07f1f77bcf86cd799439011')
            .expect(303, cb);
        },
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd799439011'
          }, function(err, submission) {
            if (err) return cb(err);
            var r = submission.reviews;
            r.length.should.eql(1);
            r[0].author.should.eql('a@b.com');
            r[0].response.should.eql('this is awesome');
            [].slice.call(r[0].satisfiedRubrics).should.eql([0, 1]);
            cb();
          });
        }
      ], done);
    });
  });

  describe('GET /submissions/:submissionId', function() {
    beforeEach(setupFixtures);

    it('should 404 when :submissionId is not an object id', function(done) {
      request(app)
        .get('/submissions/zzzzz')
        .expect(404, done);
    });

    it('should 404 when :submissionId does not exist', function(done) {
      request(app)
        .get('/submissions/507f1f77bcf86cd799439011')
        .expect(404, done);
    });

    it('should 401 when user is not logged in', function(done) {
      request(app)
        .get('/submissions/a07f1f77bcf86cd799439011')
        .expect(401, done);
    });

    it('should 403 when user has no access', function(done) {
      loggedInEmail = "lol@b.com";
      request(app)
        .get('/submissions/a07f1f77bcf86cd799439011')
        .expect(403, done);
    });

    it('should 200 when user has access', function(done) {
      loggedInEmail = "a@b.com";
      request(app)
        .get('/submissions/a07f1f77bcf86cd799439011')
        .expect(200, done);
    });
  });

  it('should show email when logged in', function(done) {
    loggedInEmail = "meh@glorb.org";
    request(app)
      .get('/')
      .expect(/meh@glorb\.org/, done);
  });

  it('should show flash messages', function(done) {
    request(app)
      .get('/test-make-flash-message')
      .expect(/class="alert alert-info"/)
      .expect(/<em>hi<\/em>/)
      .expect(200, done);
  });

  it('should include CSRF tokens in pages', function(done) {
    request(app)
      .get('/')
      .expect(/name="csrf" content="deadbeef"/)
      .expect(200, done);
  });
});
