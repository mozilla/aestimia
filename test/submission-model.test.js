var _ = require('underscore');
var async = require('async');
var should = require('should');

var db = require('./db');
var Submission = require('../').models.Submission;

var baseSubmission = {
  learner: "brian@example.org",
  criteriaUrl: "http://something.whatever.org",
  achievement: {
    name: "Tropical Koala Badge",
    description: "Awarded to Tropical Koalas.",
    imageUrl: "http://tropicalkoa.la/png"
  },
  classifications: ["science", "math"],
  evidence: [
    {
      url: "https://evidence.com/1",
      reflection: "This shows how great I did."
    },
    {
      url: "http://evidence.com/2"
    }
  ],
  rubric: {
    items: [
      { "required": true, "text": "Learner is a chill bro" },
      { "required": true, "text": "Learner isn't a jerk" },
      { "required": false, "text": "Learner can funnel like 80 beers" },
      { "required": false, "text": "Learner can even lift" }
    ]
  }
};

function ensureInvalid(invalidator) {
  return function(done) {
    var attrs = JSON.parse(JSON.stringify(baseSubmission));
    invalidator(attrs);
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
    async.series([
      db.removeAll(Submission),
      function(cb) {
        var s = new Submission(_.extend({}, baseSubmission, {
          cannedResponses: [
            "This is awesome",
            "This kind of sucks",
            "You didn't satisfy all criteria"
          ],
        }));
        s.isLearnerUnderage().should.eql(true);
        s.save(cb);
      }
    ], done);
  });

  it('should work without canned responses', function(done) {
    async.series([
      db.removeAll(Submission),
      function(cb) {
        var s = new Submission(baseSubmission);
        s.isLearnerUnderage().should.eql(false);
        s.save(cb);
      }
    ], done);
  });
});
