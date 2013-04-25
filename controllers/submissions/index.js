var querystring = require('querystring');
var Submission = require('../../models').Submission;

var gatherSubmissions = function gatherSubmission(req, res, next) {
  Submission.find({}, function(err, submissions) {
    if (err) {
      return next();
    }
    req.submissions = submissions;
    return next();
  });
};

module.exports = function(app) {
  app.get('/', [gatherSubmissions], function(req, res) {
    res.render('submissions.html', {'submissions':req.submissions});
  });

  app.get('/submission/:submissionId', function(req, res) {
  });
};
