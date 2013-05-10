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
      db.create(Mentor, {email: "foo@bar.org", classifications: ["math"]}),
      db.create(Mentor, {email: "baz@bar.org", classifications: ["math"]}),
      db.create(Mentor, {email: "a@b.org", classifications: ["beets"]}),
      // A submission foo has already reviewed and rejected...
      db.create(Submission, baseSubmission({
        _id: "000000000000000000000001",
        classifications: ["math"],
        reviews: [{
          author: "foo@bar.org",
          response: "cool yo"
        }]
      })),
      // A submission foo/baz can review...
      db.create(Submission, baseSubmission({
        _id: "000000000000000000000002",
        classifications: ["math", "science"]
      })),
      // A submission foo/baz can't review...
      db.create(Submission, baseSubmission({
        _id: "000000000000000000000003",
        classifications: ["science"]
      })),
      // A submission baz has already reviewed and awarded...
      db.create(Submission, baseSubmission({
        _id: "000000000000000000000004",
        classifications: ["math"],
        reviews: [{
          author: "baz@bar.org",
          response: "cool yo",
          satisfiedRubrics: [0, 1]
        }]
      })),
      // A submission a has already reviewed and awarded...
      db.create(Submission, baseSubmission({
        _id: "000000000000000000000005",
        classifications: ["beets"],
        reviews: [{
          author: "a@b.org",
          response: "cool yo",
          satisfiedRubrics: [0, 1]
        }]
      }))
    ], done);
  });

  it('isReviewed() should return true', function(done) {
    Submission.findOne({_id: "000000000000000000000001"}, function(err, s) {
      s.isReviewed().should.equal(true);
      done();
    });
  });

  it('isReviewed() should return false', function(done) {
    Submission.findOne({_id: "000000000000000000000002"}, function(err, s) {
      s.isReviewed().should.equal(false);
      done();
    });
  });

  it("isAwarded() should return false if sub isn't reviewed", function(done) {
    Submission.findOne({_id: "000000000000000000000002"}, function(err, s) {
      s.isAwarded().should.equal(false);
      done();
    });
  });

  it("isAwarded() should return false", function(done) {
    Submission.findOne({_id: "000000000000000000000001"}, function(err, s) {
      s.isAwarded().should.equal(false);
      done();
    });
  });

  it("isAwarded() should return true", function(done) {
    Submission.findOne({_id: "000000000000000000000004"}, function(err, s) {
      s.isAwarded().should.equal(true);
      done();
    });
  });

  it('should find reviewed submissions', function(done) {
    Submission.findReviewed("foo@bar.org", function(err, submissions) {
      if (err) return done(err);
      submissions.length.should.eql(2);
      done();
    });
  });

  it('should find submissions for reviewers', function(done) {
    Submission.findForReview("foo@bar.org", function(err, submissions) {
      if (err) return done(err);
      submissions.length.should.eql(1);
      [].slice.call(submissions[0].classifications)
        .should.eql(["math", "science"]);
      done();
    });
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
