const config = require('../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const db = mongoose.createConnection(config.MONGO_HOST, config.MONGO_DB);

db.once('error', function (error) {
  throw error;
});

db.once('open', function () {
  console.log('we have connected to the database');
});

var EvidenceItemSchema = new Schema({
  url: {
    type: String,
    trim: true
  },
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
});


var SubmissionSchema = new Schema({
  learner: {
    type: String,
    trim: true,
    require: true
  },
  criteriaUrl: {
    type: String,
    trim: true,
    require: false
  },
  classification: {
    type: Array,
    require: true
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

exports.Submission = db.model('Submission', SubmissionSchema);
