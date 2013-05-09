var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');

var Mentor = require('./mentor');

var safeUrl = [function(url) { return /^https?:\/\//.test(url); },
               "url must be http or https"];

var submissionSchema = new mongoose.Schema({
  // TODO: Add a validator for all of these.
  learner: {type: String, required: true},
  criteriaUrl: {type: String, required: true, validate: safeUrl},
  achievement: {
    name: String,
    description: String,
    imageUrl: {type: String, validate: safeUrl}
  },
  cannedResponses: [String],
  // TODO: Ensure that at least one non-empty classification exists.
  classifications: [String],
  evidence: [
    {
      url: {type: String, validate: safeUrl},
      reflection: String
    }
  ],
  rubric: {
    items: [
      {
        required: Boolean,
        text: String,
        satisfied: Boolean
      }
    ]
  },
  flagged: Boolean,
  creationDate: {type: Date, default: Date.now},
  reviewDate: Date,
  reviewer: String,
  awarded: Boolean,
  // TODO: If cannedResponses is non-empty, make sure the response is
  // one of them.
  response: String
});

submissionSchema.pre('save', function(next) {
  var self = this;

  if (!self.reviewer) return next();
  Mentor.classificationsFor(self.reviewer, function(err, classifications) {
    if (err)
      return next(err);
    if (_.intersection(classifications, self.classifications).length)
      return next();
    err = new Error("reviewer does not have permission to review");
    err.name = "ValidationError";
    err.errors = {reviewer: {message: err.message}};
    next(err);
  });
});

submissionSchema.methods.isLearnerUnderage = function() {
  return !!this.cannedResponses.length;
};

var Submission = mongoose.model('Submission', submissionSchema);

Submission.findForReview = function(email, cb) {
  async.waterfall([
    Mentor.classificationsFor.bind(Mentor, email),
    function(classifications, done) {
      Submission.find({
        reviewDate: null
      }).where('classifications').in(classifications).exec(done);
    }
  ], cb);
};

module.exports = Submission;

// This is only here so tests can mock out stuff on Mentor.
Submission.Mentor = Mentor;
