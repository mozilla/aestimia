const config = require('../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(config.MONGO_URL);
var db = mongoose.connection;

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

var SubmissionSchema = new Schema({
  clientId: {
    type: String,
    trim: true,
    require: false
  },
  learner: {
    type: String,
    trim: true,
    require: true
  },
  name : {
    type: String,
    trim: true,
    require: true
  },
  description: {
    type: String,
    trim: true,
    require: false
  },
  image: {
    type: String,
    require: false
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
    minimum: Number,
    items: [RubricItemSchema],
  },
  evaluation: {
    type: [RubricItemSchema],
    require: false
  },
  status: {
    type: String, // needs enumeration
    require: false
  }
});

exports.Submission = db.model('Submission', SubmissionSchema);
