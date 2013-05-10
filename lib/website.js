var Submission = require('./models').Submission;
var demoData = require('../test/data');

exports.findSubmissionById = function(req, res, next, id) {
  Submission.findOne({_id: id}, function(err, submission) {
    if (err) {
      if (err.name == "CastError")
        return res.send(404);
      return next(err);
    }
    if (!submission)
      return res.send(404);
    if (!req.session.email)
      return res.status(401).render('access-denied.html');
    submission.canBeReviewedBy(req.session.email, function(err, result) {
      if (err) return next(err);
      if (result) {
        res.locals.submission = submission;
        return next();
      }
      return res.status(403).render('access-denied.html');
    });
  });
};

exports.submissionDetail = function(req, res, next) {
  res.render('submission-detail.html');
};

exports.submitAssessment = function(req, res, next) {
  var submission = res.locals.submission;
  var satisfiedRubrics = [];

  submission.rubric.items.forEach(function(item, i) {
    if (req.body['rubric_' + i] == 'on')
      satisfiedRubrics.push(i);
  });
  Submission.update({
    _id: submission._id
  }, {
    $push: {
      reviews: {
        author: req.session.email,
        response: req.body.response,
        satisfiedRubrics: satisfiedRubrics
      }
    }
  }, function(err) {
    if (err) next(err);
    req.flash('success', 'Assessment submitted.');
    return res.redirect(303, req.path);
  });
};

exports.demo = function(req, res, next) {
  var submissions = [];
  Object.keys(demoData.submissions).forEach(function(name) {
    submissions.push({
      name: name,
      json: JSON.stringify(demoData.submissions[name], null, 2)
    });
  });
  res.render('demo.html', {submissions: submissions});
};

exports.index = function(req, res, next) {
  if (req.session.email) {
    Submission.findForReview(req.session.email, function(err, submissions) {
      if (err) return next(err);
      res.render('queue.html', {submissions: submissions});
    });
  } else
    res.render('splash.html');
};

function makeGetFlashMessages(req) {
  var cached = null;

  return function() {
    if (!cached) {
      cached = [];
      ['error', 'success', 'info'].forEach(function(category) {
        req.flash(category).forEach(function(html) {
          cached.push({
            category: category,
            html: html
          });
        });
      });
    }
    return cached;
  };
}

exports.setResponseLocalsForTemplates = function(req, res, next) {
  res.locals.csrfToken = req.session._csrf;
  res.locals.email = req.session.email;
  res.locals.messages = makeGetFlashMessages(req);
  next();
};
