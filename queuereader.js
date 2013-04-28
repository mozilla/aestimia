/*
reads the SQS queue and creates local submissions for evaluation,
runs and runs and runs

USAGE: node queuereader.js

*/
const queue = require('./queue');
const read = queue.readFrom;
const Submission = require('models').Submission;

console.log("queue reader started listening on " + read);
queue.pull(read, function(message, done) {
  console.log(message);
  var newSubmission = new Submission(message);
  newSubmission.save(function(err, submission) {
    if (err) {
      // we should report the error somewhere...Winston?
    } else {
      console.log("message received and logged " + submission._id);
      done(); // deletes the message from the queue
    }
  });
});

queue.on('error', function(err) { console.log(err) });
