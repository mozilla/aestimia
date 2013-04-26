var querystring = require('querystring');
var Submission = require('../../models').Submission;

var gatherSubmissions = function gatherSubmission(req, res, next) {
  // we want a single submission
  if (req.params.submissionId) {
    var id = escape(req.params.submissionId);
    Submission.findById(id, function(err, submission) {
      if (err) {
        if (err.name == 'CastError') {
          return res.send(404);
        } else {
          return res.send(500, err);
        }
      }
      if (submission) {
        req.submission = submission;
        return next();
      } else {
        return res.send(404);
      };
    });
  } else {
  // we want a bunch of submissions
    Submission.find({}, function(err, submissions) {
      if (err) {
        return next();
      }
      req.submissions = submissions;
      return next();
    });
  }
};

module.exports = function(app) {
  app.get('^/$', [gatherSubmissions], function(req, res) {
    res.render('submissions.html', {'submissions':req.submissions});
  });

  app.get('/submission/:submissionId', [gatherSubmissions], function(req, res) {
    res.render('submissionDetail.html', {'submission':req.submission});
  });
};
