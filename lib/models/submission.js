var mongoose = require('mongoose');

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
  response: String
});

submissionSchema.methods.isLearnerUnderage = function() {
  return !!this.cannedResponses.length;
};

var Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
