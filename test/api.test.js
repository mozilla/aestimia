var request = require('supertest');
var should = require('should');
var sinon = require('sinon');
var async = require('async');

var utils = require('./utils');
var data = require('./data');
var db = require('./db');
var aestimia = require('../');

db.init();

describe('API', function() {
  var app = utils.buildApp({
    apiKey: 'lol',
    defineExtraRoutes: function(app) {
      app.get('/api/foo', function(req, res) {
        res.send('here is info');
      });
    }
  });
  var authHeader = 'Basic ' + new Buffer('api:lol').toString('base64');

  it('should return 401 when no auth is given', function(done) {
    request(app)
      .get('/api/foo')
      .expect('Unauthorized')
      .expect(401, done);
  });

  it('should return content when auth is given', function(done) {
    request(app)
      .get('/api/foo')
      .set('Authorization', authHeader)
      .expect('here is info')
      .expect(200, done);
  });

  it('GET /submissions should fail if no search query', function(done) {
    request(app)
      .get('/api/submissions')
      .set('Authorization', authHeader)
      .expect({message: 'invalid search query'})
      .expect(422, done);
  });

  it('GET /submission/:submissionId should work', function(done) {
    async.series([
      db.removeAll(aestimia.models.Submission),
      db.create(aestimia.models.Submission, data.baseSubmission({
        _id: "000000000000000000000001",
        learner: "foo@bar.org",
        classifications: ["math"],
      })),
      function(cb) {
        request(app)
          .get('/api/submissions/000000000000000000000001')
          .set('Authorization', authHeader)
          .expect(200, function(err, res) {
            if (err) return cb(err);
            res.body._id.should.eql("000000000000000000000001");
            res.body.learner.should.eql("foo@bar.org");
            cb();
          });
      }
    ], done);
  });

  it('GET /submissions should list learner submissions', function(done) {
    async.series([
      db.removeAll(aestimia.models.Submission),
      db.create(aestimia.models.Submission, data.baseSubmission({
        _id: "000000000000000000000001",
        learner: "foo@bar.org",
        classifications: ["math"],
      })),
      db.create(aestimia.models.Submission, data.baseSubmission({
        _id: "000000000000000000000002",
        learner: "someone_else@bar.org",
        classifications: ["math"],
      })),
      function(cb) {
        request(app)
          .get('/api/submissions?learner=foo%40bar.org')
          .set('Authorization', authHeader)
          .expect(200, function(err, res) {
            if (err) return cb(err);
            res.body.length.should.eql(1);
            res.body[0]._id.should.eql("000000000000000000000001");
            res.body[0].learner.should.eql("foo@bar.org");
            cb();
          });
      }
    ], done);
  });

  it('GET /mentors should list mentors', function(done) {
    async.series([
      db.removeAll(aestimia.models.Mentor),
      db.create(aestimia.models.Mentor, {
        email: "foo@bar.org",
        classifications: ['u']
      }),
      function(cb) {
        request(app)
          .get('/api/mentors')
          .set('Authorization', authHeader)
          .expect([{
            email: "foo@bar.org",
            classifications: ['u']
          }])
          .expect(200, cb);
      }
    ], done);
  });

  it('POST /mentor should return 400 w/ bad input', function(done) {
    request(app)
      .post('/api/mentor')
      .set('Authorization', authHeader)
      .send({u: 1})
      .expect({message: 'invalid email'})
      .expect(422, done);
  });

  it('POST /mentor removes mentor when only email is given', function(done) {
    async.series([
      db.removeAll(aestimia.models.Mentor),
      db.create(aestimia.models.Mentor, {
        email: "foo@bar.org",
        classifications: ['u']
      }),
      function(cb) {
        request(app)
          .post('/api/mentor')
          .set('Authorization', authHeader)
          .send({email: 'foo@bar.org'})
          .expect({message: 'deleted'})
          .expect(200, cb);
      },
      function(cb) {
        aestimia.models.Mentor.findOne({
          email: 'foo@bar.org'
        }, function(err, mentor) {
          cb(err || (mentor && new Error("mentor not deleted!")) || null);
        });
      }
    ], done);    
  });

  it('POST /mentor should upsert mentors', function(done) {
    async.series([
      db.removeAll(aestimia.models.Mentor),
      function(cb) {
        request(app)
          .post('/api/mentor')
          .set('Authorization', authHeader)
          .send({email: 'meh@barf.org', classifications: ['lol', 'u']})
          .expect({message: 'updated'})
          .expect(200, cb);
      },
      function(cb) {
        aestimia.models.Mentor.findOne({
          email: 'meh@barf.org'
        }, function(err, mentor) {
          if (err) return cb(err);
          [].slice.call(mentor.classifications).should.eql(['lol', 'u']);
          cb();
        });
      }
    ], done);
  });
  
  it('/submission should accept valid submissions', function(done) {
    request(app)
      .post('/api/submission')
      .set('Authorization', authHeader)
      .send(data.baseSubmission())
      .expect(201, function(err, res) {
        if (err) return done(err);
        res.body.id.should.match(/[a-f0-9]+/);
        done();
      });
  });

  it('/submission should forward unexpected errors', function(done) {
    var next = sinon.spy();
    var err = new Error('o snap');
    sinon.stub(aestimia.models, 'Submission', function() {
      return {
        save: function(cb) {
          cb(err);
        }
      };
    });
    aestimia.api.submit({}, {}, next);
    aestimia.models.Submission.restore();
    next.calledOnce.should.eql(true);
    next.calledWith(err).should.eql(true);
    done();
  });

  it('/submission should reject invalid submissions', function(done) {
    request(app)
      .post('/api/submission')
      .set('Authorization', authHeader)
      .send(data.baseSubmission({
        criteriaUrl: 'javascript:lol()'
      }))
      .expect({
        message: 'Validation Error',
        errors: {
          criteriaUrl: 'Validator "url must be http or https" failed for ' +
                       'path criteriaUrl with value `javascript:lol()`'
        }
      })
      .expect(422, done);
  });

  it('/submission should reject submissions w/ bad types', function(done) {
    request(app)
      .post('/api/submission')
      .set('Authorization', authHeader)
      .send(data.baseSubmission({
        creationDate: 'wat'
      }))
      .expect({
        message: 'Cast to date failed for value "wat" at path "creationDate"',
      })
      .expect(422, done);
  });

});
