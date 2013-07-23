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
    })),
    db.create(models.Submission, data.baseSubmission({
      _id: "a07f1f77bcf86cd7994390ff",
      flagged: true
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

  it("should serve pages loading persona's include.js", function(done) {
    request(app)
      .get('/')
      .expect(/https:\/\/login\.persona\.org\/include\.js/, done);
  });

  it('should return 200 OK with HTML at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });

  it('should return 200 OK with HTML at /docs', function(done) {
    request(app)
      .get('/docs')
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

    it('should show "No badges to review right now"', function(done) {
      loggedInEmail = "meh@glorb.org";
      request(app)
        .get('/')
        .expect(/No badges to review right now/, done);
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

  describe('showPaginatedSubmissions()', function() {
    var req, res, next, tester;

    beforeEach(function() {
      req = {
        query: {},
        path: '/foo',
        session: {email: 'foo@bar.org'}
      };
      res = {
        render: sinon.spy(),
        redirect: sinon.spy()
      };
      next = sinon.spy();
      tester = models.Submission.tester = sinon.stub();
    });

    afterEach(function() {
      delete models.Submission['tester'];
    });

    it('should pass email address to Submission method', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][0].email.should.eql('foo@bar.org');
    });

    it('should go to page 1 if no query arg', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][0].page.should.eql(1);
    });

    it('should go to page 1 if negative query arg', function() {
      req.query.page = '-53';
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][0].page.should.eql(1);
    });

    it('should go to page 1 if 0 query arg', function() {
      req.query.page = '0';
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][0].page.should.eql(1);
    });

    it('should propagate errors', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1]('barf');
      next.args[0][0].should.eql('barf');
    });

    it('should redirect if page # out of bounds', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, [], 5);
      res.redirect.args[0].should.eql([302, '/foo?page=5']);
    });

    it('should call render w/ expected view', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, ['hi'], 5);
      res.render.args[0][0].should.eql('lol.html');
    });

    it('should call render w/ prevPage, nextPage set to false', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, ['u'], 1);
      res.render.args[0][1].prevPage.should.equal(false);
      res.render.args[0][1].nextPage.should.equal(false);
    });

    it('should call render w/ nextPage set to link', function() {
      req.query.page = 2;
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, ['hi'], 5);
      res.render.args[0][1].nextPage.should.eql('/foo?page=3');
    });

    it('should call render w/ nextPage set to false', function() {
      req.query.page = 5;
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, ['hi'], 5);
      res.render.args[0][1].nextPage.should.eql(false);
    });

    it('should call render w/ prevPage set to link', function() {
      req.query.page = 2;
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, ['hi'], 5);
      res.render.args[0][1].prevPage.should.eql('/foo?page=1');
    });

    it('should call render w/ prevPage set to false', function() {
      website.showPaginatedSubmissions('tester', 'lol.html', req, res, next);
      tester.args[0][1](null, ['hi'], 5);
      res.render.args[0][1].prevPage.should.equal(false);
    });
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
    this.timeout(15000);

    beforeEach(setupFixtures);

    it('should not crash when calling onChangeUrl webhook', function(done) {
      var serverUrl;
      var server = require('net').createServer(function(socket) {
        socket.end();
      });

      loggedInEmail = "a@b.com";
      async.series([
        server.listen.bind(server),
        function(cb) {
          serverUrl = "http://localhost:" + server.address().port + "/";
          var sub = new models.Submission(data.baseSubmission({
            _id: "a07f1f77bcf86cd799439012",
            onChangeUrl: serverUrl
          }));
          sub.save(cb);
        },
        function(cb) {
          async.parallel([
            function(cb) {
              request(app)
                .post('/submissions/a07f1f77bcf86cd799439012')
                .send({
                  _csrf: 'deadbeef',
                  response: 'this is awesome'
                })
                .expect(303, cb);
            },
            function(cb) {
              sinon.stub(console, "error", function() {
                console.error.restore();
                [].slice.call(arguments).should.eql([
                  "calling webhook", serverUrl,
                  "for submission", 'a07f1f77bcf86cd799439012',
                  "failed with error", "socket hang up"
                ]);
                cb();
              });
            }
          ], cb);
        }
      ], function(err) {
        server.close();
        done(err);
      });
    });

    it('should call onChangeUrl webhook on change', function(done) {
      var express = require('express');
      var events = require('events');
      var webhookApp = express();
      var webhookServer = require('http').createServer(webhookApp);
      var body;
      var bodyListener = new events.EventEmitter();

      webhookApp.use(express.bodyParser());
      webhookApp.post('/lol', function(req, res) {
        if (body) throw new Error('body is already set');
        body = req.body;
        bodyListener.emit('setBody');
        res.send('thanks');
      });

      loggedInEmail = "a@b.com";
      async.series([
        webhookServer.listen.bind(webhookServer),
        function(cb) {
          var sub = new models.Submission(data.baseSubmission({
            _id: "a07f1f77bcf86cd799439012",
            onChangeUrl: "http://localhost:" + webhookServer.address().port +
                         "/lol"
          }));
          sub.save(cb);
        },
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd799439012')
            .send({
              _csrf: 'deadbeef',
              response: 'this is awesome'
            })
            .expect(303, cb);
        },
        function(cb) {
          if (body) return cb();
          bodyListener.on('setBody', cb);
        },
        function(cb) {
          webhookServer.close();
          body.should.eql({_id: "a07f1f77bcf86cd799439012"});
          cb();
        }
      ], done);
    });

    it('should allow self-assigning', function(done) {
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd7994390ff')
            .send({
              _csrf: 'deadbeef',
              action: 'assign'
            })
            .expect('Location', '/submissions/a07f1f77bcf86cd7994390ff#assess')
            .expect(303, cb);
        },
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd7994390ff'
          }, function(err, submission) {
            if (err) return cb(err);
            submission.assignedTo.mentor.should.eql('a@b.com');
            submission.assignedTo.expiry.getTime()
              .should.be.within(Date.now(),
                                Date.now() + website.ASSIGNMENT_LOCKOUT_MS);
            cb();
          });
        }
      ], done);
    });

    it('should disallow self-assigning on conflicts', function(done) {
      var expTime = Date.now() + 60000;
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd7994390ff'
          }, function(err, submission) {
            if (err) return cb(err);
            submission.assignTo('blah@b.com', expTime, cb);
          });
        },
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd7994390ff')
            .send({
              _csrf: 'deadbeef',
              action: 'assign'
            })
            .expect('Location', '/submissions/a07f1f77bcf86cd7994390ff')
            .expect(303, cb);
        },
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd7994390ff'
          }, function(err, submission) {
            if (err) return cb(err);
            submission.assignedTo.mentor.should.eql('blah@b.com');
            submission.assignedTo.expiry.getTime().should.eql(expTime);
            cb();
          });
        }
      ], done);
    });

    it('should allow self-unassigning', function(done) {
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd7994390ff')
            .send({
              _csrf: 'deadbeef',
              action: 'unassign'
            })
            .expect('Location', '/submissions/a07f1f77bcf86cd7994390ff')
            .expect(303, cb);
        },
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd7994390ff'
          }, function(err, submission) {
            if (err) return cb(err);
            submission.assignedTo.mentor.should.eql('a@b.com');
            submission.assignedTo.expiry.getTime()
              .should.be.within(Date.now() - 60000, Date.now());
            cb();
          });
        }
      ], done);
    });

    it('should work w/ unflagging', function(done) {
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd7994390ff')
            .send({
              _csrf: 'deadbeef',
              action: 'unflag'
            })
            .expect('Location', '/submissions/a07f1f77bcf86cd7994390ff')
            .expect(303, cb);
        },
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd7994390ff'
          }, function(err, submission) {
            if (err) return cb(err);
            submission.flagged.should.eql(false);
            cb();
          });
        }
      ], done);
    });

    it('should work w/ flagging', function(done) {
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd799439011')
            .send({
              _csrf: 'deadbeef',
              action: 'flag'
            })
            .expect('Location', '/submissions/a07f1f77bcf86cd799439011')
            .expect(303, cb);
        },
        function(cb) {
          models.Submission.findOne({
            _id: 'a07f1f77bcf86cd799439011'
          }, function(err, submission) {
            if (err) return cb(err);
            submission.flagged.should.eql(true);
            cb();
          });
        }
      ], done);
    });

    it('should reject assessments w/ no response', function(done) {
      loggedInEmail = "a@b.com";
      async.series([
        function(cb) {
          request(app)
            .post('/submissions/a07f1f77bcf86cd799439011')
            .send({
              _csrf: 'deadbeef',
              response: '   ',
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
            r.length.should.eql(0);
            cb();
          });
        }
      ], done);
    });

    it('should work w/ assessment', function(done) {
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
