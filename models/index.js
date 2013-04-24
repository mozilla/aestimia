const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/csol');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('we have connected to the database');
});

var EvidenceItemSchema = new Schema({
  url: String,
  reflection: String
});

var RubricItemSchema = new Schema({
  required: Boolean,
  text: String,
  pass: Boolean
});

var RubricSchema = new Schema({
  minimum: Number,
  items: [RubricItemSchema]
})
  

var SubmissionSchema = new Schema({
  learner: {
    type: String,
    trim: true,
    require: false
  },
  criteriaUrl: {
    type: String,
    trim: true,
    require: false
  },
  classification: {
    type: Array,
    require: false
  },
  evidence: [EvidenceItemSchema],
  rubric: {
    type: [RubricItemSchema],
    require: false
  },
  evaluation: {
    type: [RubricItemSchema],
    require: false
  }
});

exports.Submission = mongoose.model('Submission', SubmissionSchema);
