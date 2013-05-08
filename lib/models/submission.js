var mongoose = require('mongoose');

var submissionSchema = new mongoose.Schema({
  // TODO: Add a validator for all of these.
  learner: {type: String, required: true},
  criteriaUrl: {type: String, required: true},
  achievement: {
    name: String,
    description: String,
    imageUrl: String
  },
  cannedResponses: [String],
  classifications: [String],
  evidence: [
    {
      url: String,
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
  creationDate: Date,
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
