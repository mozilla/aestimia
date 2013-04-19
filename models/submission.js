const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/csol');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('we have connected to the database');
});

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
  rubric: {
    type: Array,
    require: false
  },
  evaluation: {
    type: Array,
    require: false
  }
});

exports.Submission = mongoose.model('Submission', SubmissionSchema);
