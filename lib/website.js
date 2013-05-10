var Submission = require('./models').Submission;
var demoData = require('../test/data');

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
