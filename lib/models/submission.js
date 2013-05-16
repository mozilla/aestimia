var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');

var Mentor = require('./mentor');

var safeUrl = [function(url) { return /^https?:\/\//.test(url); },
               "url must be http or https"];

var validMediaType = [
  function(value) {
    return ~['image', 'link'].indexOf(value);
  },
  'invalid media type'
];

var reviewSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  author: {type: String, required: true},
  response: {type: String, required: true},
  satisfiedRubrics: [Number]
});

var submissionSchema = new mongoose.Schema({
  // TODO: Add a validator for all of these.
  learner: {type: String, required: true},
  criteriaUrl: {type: String, required: true, validate: safeUrl},
  achievement: {
    name: String,
    description: String,
    imageUrl: {type: String, validate: safeUrl}
  },
  // TODO: If cannedResponses is non-empty, make sure the reviewed
  // response is one of them.
  cannedResponses: [String],
  // TODO: Ensure that at least one non-empty classification exists.
  classifications: [String],
  evidence: [
    {
      url: {type: String, validate: safeUrl},
      mediaType: {type: String, default: "link", validate: validMediaType},
      reflection: String
    }
  ],
  flagged: Boolean,
  creationDate: {type: Date, default: Date.now},
  // TODO: Ensure that at least one rubric is required.
  rubric: {
    items: [
      {
        required: Boolean,
        text: String
      }
    ]
  },
  reviews: [reviewSchema],
});

reviewSchema.pre('save', function(next) {
  var parent = this.ownerDocument();
  var self = this;

  Mentor.classificationsFor(self.author, function(err, classifications) {
    if (err)
      return next(err);
    if (_.intersection(classifications, parent.classifications).length)
      return next();
    err = new Error("reviewer " + self.author + " does not have " +
                    "permission to review");
    err.name = "ValidationError";
    err.errors = {reviewer: {message: err.message}};
    next(err);
  });
});

submissionSchema.methods.latestReview = function() {
  return this.reviews[this.reviews.length-1];
};

submissionSchema.methods.isReviewed = function() {
  return !!this.reviews.length;
};

submissionSchema.methods.isAwarded = function() {
  if (!this.reviews.length)
    return false;
  var satisfied = this.latestReview().satisfiedRubrics;
  var result = true;
  this.rubric.items.forEach(function(item, i) {
    if (item.required && satisfied.indexOf(i) == -1)
      result = false;
  }, this);
  return result;
};

submissionSchema.methods.canBeReviewedBy = function(email, cb) {
  var self = this;

  async.waterfall([
    Mentor.classificationsFor.bind(Mentor, email),
    function(classifications, done) {
      if (_.intersection(classifications, self.classifications).length)
        return done(null, true);
      return done(null, false);
    }
  ], cb);
};

submissionSchema.methods.isLearnerUnderage = function() {
  return !!this.cannedResponses.length;
};

var Submission = mongoose.model('Submission', submissionSchema);

function findSubmissions(options, cb) {
  async.waterfall([
    Mentor.classificationsFor.bind(Mentor, options.email),
    function(classifications, done) {
      options.criteria.classifications = {$in: classifications};
      Submission.paginate({
        criteria: options.criteria,
        options: {},
        page: options.page,
        resultsPerPage: options.resultsPerPage
      }, done);
    }
  ], cb);
}

Submission.findReviewed = function(options, cb) {
  findSubmissions({
    criteria: {reviews: {$not: {$size: 0}}},
    email: options.email,
    page: options.page,
    resultsPerPage: options.resultsPerPage
  }, cb);
};

Submission.findForReview = function(options, cb) {
  findSubmissions({
    criteria: {reviews: {$size: 0}},
    email: options.email,
    page: options.page,
    resultsPerPage: options.resultsPerPage
  }, cb);
};

module.exports = Submission;

// This is only here so tests can mock out stuff on Mentor.
Submission.Mentor = Mentor;
