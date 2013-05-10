var _ = require('underscore');
var async = require('async');
var should = require('should');
var sinon = require('sinon');

var db = require('./db');
var data = require('./data');
var baseSubmission = data.baseSubmission;
var models = require('../').models;
var Submission = models.Submission;
var Mentor = models.Mentor;

function ensureInvalid(invalidator) {
  return function(done) {
    var attrs = baseSubmission(invalidator);
    async.series([
      db.removeAll(Submission),
      db.create(Submission, attrs)
    ], function(err) {
      err.name.should.eql('ValidationError');
      done();
    });
  };
}

db.init();

describe('Submission', function() {
  beforeEach(function(done) {
    async.series([
      db.removeAll(Submission),
      db.removeAll(Mentor),
      db.create(Mentor, {email: "foo@bar.org", classifications: ["math"]})      
    ], done);
  });

  it('should find submissions for reviewers', function(done) {
    async.series([
      // A submission the user has already reviewed...
      db.create(Submission, baseSubmission({
        classifications: ["math"],
        reviews: [{
          author: "foo@bar.org",
          response: "cool yo"
        }]
      })),
      // A submission the user can review...
      db.create(Submission, baseSubmission({
        classifications: ["math", "science"]
      })),
      // A submission the user doesn't have permission to review...
      db.create(Submission, baseSubmission({
        classifications: ["science"]
      })),
      function(cb) {
        Submission.findForReview("foo@bar.org", function(err, submissions) {
          submissions.length.should.eql(1);
          submissions[0].classifications.length.should.eql(2);
          cb();
        });
      }
    ], done)
  });

  it('should propagate errors in reviewer validation', function(done) {
    sinon.stub(Submission.Mentor, 'classificationsFor', function(who, cb) {
      cb(new Error("oof"));
    });
    new Submission(baseSubmission({
      reviews: [{author: "foo@bar.org", response: "neat"}]
    })).save(function(err) {
      Submission.Mentor.classificationsFor.restore();
      err.message.should.eql("oof");
      done();
    });
  });

  it('should accept reviewers with proper permissions', function(done) {
    new Submission(baseSubmission({
      reviews: [{author: "foo@bar.org", response: "rad"}]
    })).save(done);
  });

  it('should reject reviewers without proper permissions', function(done) {
    new Submission(baseSubmission({
      reviews: [{author: "a@b.com", response: "nifty"}]
    })).save(function(err) {
      err.name.should.eql("ValidationError");
      err.errors.reviewer.message
        .should.eql("reviewer a@b.com does not have permission to review");
      done();      
    });
  });

  it('should reject unsafe urls for evidence', ensureInvalid(function(attrs) {
    attrs.evidence[1].url = "javascript:lol()";
  }));

  it('should reject unsafe urls for criteria', ensureInvalid(function(attrs) {
    attrs.criteriaUrl = "javascript:lol()";
  }));

  it('should reject unsafe urls for image', ensureInvalid(function(attrs) {
    attrs.achievement.imageUrl = "javascript:lol()";
  }));

  it('should work with canned responses', function(done) {
    var s = new Submission(data.submissions['canned-responses']);
    s.isLearnerUnderage().should.eql(true);
    s.save(done);
  });

  it('should work without canned responses', function(done) {
    var s = new Submission(data.submissions['base']);
    s.isLearnerUnderage().should.eql(false);
    s.save(done);
  });
});
