const Submission = require('../models').Submission;

var getSubmission = function getSubmission(req, res, next) {
  Submission.findById(req.params.submissionId, function(err, s) {
    req.submission = s;
    return next();
  });
};

var getEvaluation = function getEvaluation(req, res, next) {
  req.evaluation = req.submission.rubric.items.id(req.params.evaluationId);
  return next();
};

module.exports = function(app) {
  app.post('^/api/submission/:submissionId/evaluation/:evaluationId', [getSubmission, getEvaluation], function(req, res) {
    /*console.log(req.params);
    console.log(req.body);
    console.log("sub id " + req.params.submissionId + "eval id " + req.params.evaluationId + req.body.pass);
    console.log("middleware says SUBMISSION" + req.submission);
    console.log("middleware says EVALUATION" + req.evaluation);*/
    res.send(200, "FYI DERS, I've been on the server and everything: " + req.submission.id + "::" + req.evaluation.id);
  });
};
