var request = require('request');

var Submission = require('./models').Submission;
var demoData = require('../test/data');
var docs = require('./documentation');

const RESULTS_PER_PAGE = 10;

exports.findSubmissionById = function(req, res, next, id) {
  Submission.findOne({_id: id}, function(err, submission) {
    function proceed() {
      res.locals.submission = submission;
      next();      
    }

    if (err) {
      if (err.name == "CastError")
        return res.send(404);
      return next(err);
    }
    if (!submission)
      return res.send(404);
    if (req.isApi)
      return proceed();
    if (!req.session.email)
      return res.status(401).render('access-denied.html');
    submission.canBeReviewedBy(req.session.email, function(err, result) {
      if (err) return next(err);
      if (result)
        return proceed();
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
    if (submission.onChangeUrl) {
      request.post({
        url: submission.onChangeUrl,
        json: {
          _id: submission._id
        }
      });
    }
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
  res.render('demo.html', {
    submissions: submissions,
    sections: docs.parseRawApiSections()
  });
};

exports.docs = function(req, res) {
  return res.render('docs.html', {sections: docs.parseRawApiSections()});
};

var showPaginatedSubmissions = exports.showPaginatedSubmissions =
function showPaginatedSubmissions(methodName, view, req, res, next) {
  var page = parseInt(req.query.page);
  var linkToPage = function(page) {
    return req.path + '?page=' + page;
  };

  if (isNaN(page) || page <= 0) page = 1;

  Submission[methodName]({
    email: req.session.email,
    page: page,
    resultsPerPage: RESULTS_PER_PAGE
  }, function(err, submissions, totalPages) {
    if (err) return next(err);
    if (!submissions.length && totalPages)
      return res.redirect(302, linkToPage(totalPages));
    res.render(view, {
      submissions: submissions,
      page: page,
      totalPages: totalPages,
      prevPage: (page > 1) && linkToPage(page - 1),
      nextPage: (page < totalPages) && linkToPage(page + 1)
    });
  });
}

exports.history = function(req, res, next) {
  if (req.session.email) {
    showPaginatedSubmissions('findReviewed', 'history.html', req, res, next);
  } else
    res.status(401).render('access-denied.html');
};

exports.index = function(req, res, next) {
  if (req.session.email) {
    showPaginatedSubmissions('findForReview', 'queue.html', req, res, next);
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
