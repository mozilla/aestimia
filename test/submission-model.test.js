var _ = require('underscore');
var async = require('async');
var should = require('should');
var sinon = require('sinon');

var db = require('./db');
var data = require('./data');
var baseSubmission = data.baseSubmission;
var reviewedSubmissions = data.reviewedSubmissions;
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
      db.create(Mentor, data.mentors['baz_math']),
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
      db.create(Submission, _.extend({}, reviewedSubmissions['awarded'], {
        _id: "000000000000000000000004",
        classifications: ["math"],
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
      })),
      db.create(Submission, baseSubmission({
        _id: "000000000000000000000006",
        flagged: true
      }))
    ], done);
  });

  it('isReviewed() should return true when reviews > 0', function(done) {
    Submission.findOne({_id: "000000000000000000000001"}, function(err, s) {
      s.isReviewed().should.equal(true);
      done();
    });
  });

  it('isReviewed() should return true when flagged', function(done) {
    Submission.findOne({_id: "000000000000000000000006"}, function(err, s) {
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
    Submission.findReviewed({
      email: "foo@bar.org",
      page: 1,
      resultsPerPage: 100
    }, function(err, submissions, totalPages) {
      if (err) return done(err);
      totalPages.should.eql(1);
      submissions.length.should.eql(3);
      done();
    });
  });

  it('should find submissions for reviewers', function(done) {
    Submission.findForReview({
      email: "foo@bar.org",
      page: 1,
      resultsPerPage: 100
    }, function(err, submissions, totalPages) {
      if (err) return done(err);
      totalPages.should.eql(1);
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

  it('should reject un-canned responses', function(done) {
    new Submission(_.extend({}, data.submissions['canned-responses'], {
      reviews: [{author: "foo@bar.org", response: "rad"}]
    })).save(function(err) {
      err.name.should.eql("ValidationError");
      err.errors.response.message
        .should.eql("review response is not in list of canned responses");
      done();
    });
  });

  it('should not reject canned responses', function(done) {
    new Submission(_.extend({}, data.submissions['canned-responses'], {
      reviews: [{author: "foo@bar.org", response: "This kind of sucks"}]
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

  // This test only really verifies how we expect Mongoose to work, not any
  // special trait of our code.
  it('should have expected mongoose update semantics', function(done) {
    var s = new Submission(data.submissions['base']);

    s.save(function(err) {
      if (err) throw err;

      Submission.findOne({_id: s._id}, function(err, s2) {
        if (err) throw err;
        if (!s2) throw new Error("s2 should be truthy");

        s.assignedTo.mentor = "a@lol.org";
        s.learner = "learner@somewhere.org";
        s.save(function(err, newS) {
          if (err) throw err;
          if (newS !== s) throw new Error("newS !== s");
          s.assignedTo.mentor.should.eql("a@lol.org");
          if (s2.assignedTo.mentor) throw new Error();

          // Even though s2 now represents an "old" version of our model,
          // changing it and saving it shouldn't raise any errors.
          s2.assignedTo.mentor = "b@lol.org";
          s2.learner.should.eql("brian@example.org");
          s2.save(function(err) {
            if (err) throw err;
            s.assignedTo.mentor.should.eql("a@lol.org");
            s2.assignedTo.mentor.should.eql("b@lol.org");
            Submission.findOne({_id: s._id}, function(err, s3) {
              s3.assignedTo.mentor.should.eql("b@lol.org");

              // Even though s2's learner value was brian@example.org,
              // it shouldn't have been saved because we didn't change it.
              s3.learner.should.eql("learner@somewhere.org");
              done();
            });
          });
        });
      });
    });
  });

  it('should assign submissions to mentors atomically', function(done) {
    var submission = new Submission(data.submissions['base']);
    var fakeTime = 0;
    var oldS;

    should.equal(submission.getAssignee(), null);
    sinon.stub(Date, 'now', function() { return fakeTime; });
    async.waterfall([
      submission.save.bind(submission),
      function(s, _, cb) { s.assignTo("mentor@mentors.org", 5, cb); },
      function assignmentSucceeds(s, cb) {
        s.assignedTo.mentor.should.eql("mentor@mentors.org");
        s.assignedTo.expiry.getTime().should.eql(5);
        should.equal(s.getAssignee(), "mentor@mentors.org");
        oldS = s;
        cb(null, s);
      },
      function assignDuringUnexpiredAssignmentFails(s, cb) {
        fakeTime = 1;
        should.equal(s.getAssignee(), "mentor@mentors.org");
        s.assignTo("other@mentors.org", 5, function(err, nullSub) {
          if (err) return cb(err);
          cb(nullSub === null ? null : new Error("nullSub !== null"), s);
        });
      },
      function assignAfterExpiredAssignmentSucceeds(s, cb) {
        fakeTime = 6;
        should.equal(s.getAssignee(), null);
        s.assignTo("other2@mentors.org", 10, function(err, s) {
          if (err) return cb(err);
          should.equal(s.getAssignee(), "other2@mentors.org");
          cb(s === null ? new Error("s is null") : null);
        });
      },
      function staleAssignmentsShouldFail(cb) {
        oldS.assignedTo.mentor.should.eql("mentor@mentors.org");
        oldS.assignedTo.expiry.getTime().should.eql(5);
        oldS.assignTo("other2@mentors.org", 10, function(err, nullSub) {
          if (err) return cb(err);
          cb(nullSub === null ? null : new Error("stale assignment fail"));
        });
      }
    ], function(err) {
      Date.now.restore();
      done(err);
    });
  });
});

describe('Submission aggregation', function() {
  beforeEach(function(done) {
    async.series([
      db.removeAll(Submission),
      db.removeAll(Mentor),
      db.create(Mentor, {email: "foo@bar.org", classifications: ["math"]}),
      db.create(Submission, baseSubmission({
        creationDate: new Date(2013, 01, 01),
        reviews: [{
          date: new Date(2013, 01, 01),
          author: "foo@bar.org",
          response: "reviewed on jan 1"
        }]
      })),
      db.create(Submission, baseSubmission({
        creationDate: new Date(2013, 01, 01),
        reviews: [{
          date: new Date(2013, 01, 03),
          author: "foo@bar.org",
          response: "reviewed on jan 3"
        }]
      })),
      db.create(Submission, baseSubmission({
        creationDate: new Date(2013, 01, 01),
        flagged: true
      })),
      db.create(Submission, baseSubmission({
        creationDate: new Date(2013, 01, 01)
      })),
      db.create(Submission, baseSubmission({
        creationDate: new Date(2013, 01, 03)
      }))
    ], done);
  });

  it('provides # of submissions ever reviewed', function(done) {
    Submission.countReviewed(function(err, count) {
      if (err) throw err;
      count.should.eql(2);
      done();
    });
  });

  it('provides # of submissions reviewed since date', function(done) {
    Submission.countReviewed(new Date(2013, 01, 02), function(err, count) {
      if (err) throw err;
      count.should.eql(1);
      done();
    });
  });

  it('provides # of unreviewed submissions', function(done) {
    Submission.countUnreviewed(function(err, count) {
      if (err) throw err;
      count.should.eql(2);
      done();
    });
  });  

  it('provides # of unreviewed submissions since date', function(done) {
    Submission.countUnreviewed(new Date(2013, 01, 02), function(err, count) {
      if (err) throw err;
      count.should.eql(1);
      done();
    });
  });

  it('provides dashboard statistics', function(done) {
    var fakeTime = new Date(2013, 01, 03).getTime();

    sinon.stub(Date, 'now', function() { return fakeTime; });
    Submission.getDashboardStatistics(function(err, stats) {
      Date.now.restore();
      if (err) throw err;
      stats.should.eql({
        reviewed: 2,
        reviewedToday: 1,
        unreviewed: 2,
        unreviewedToday: 1
      });
      done();
    });
  });
});
