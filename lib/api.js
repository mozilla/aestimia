var models = require('./models');

function handleMongooseError(err, res, next) {
  if (err.name == "ValidationError") {
    res.send(422, makeConciseValidationError(err));
  } else if (err.name == "CastError") {
    res.send(422, {message: err.message});
  } else {
    next(err);
  }
}

function makeConciseValidationError(err) {
  var errors = {};
  Object.keys(err.errors).forEach(function(error) {
    errors[error] = err.errors[error].message;
  });
  return {
    message: "Validation Error",
    errors: errors
  };
}

exports.getSubmission = function(req, res, next) {
  res.send(res.locals.submission);
};

exports.listSubmissions = function(req, res, next) {
  if (!req.query.learner)
    return res.send(422, {"message": "invalid search query"});

  models.Submission.find({
    learner: req.query.learner
  }, function(err, submissions) {
    if (err) return next(err);
    return res.send(submissions);
  });
};

exports.listMentors = function(req, res, next) {
  models.Mentor.find(function(err, mentors) {
    if (err) return next(err);

    var json = mentors.map(function(mentor) {
      return {
        email: mentor.email,
        classifications: mentor.classifications
      };
    });

    res.send(json);
  });
};

exports.changeMentor = function(req, res, next) {
  var email = req.body.email;
  var classifications = req.body.classifications;

  if (typeof(email) != "string")
    return res.send(422, {message: "invalid email"});

  if (!classifications || !classifications.length)
    models.Mentor.remove({email: email}, function(err) {
      if (err) return handleMongooseError(err, res, next);
      res.send(200, {message: "deleted"});
    });
  else
    models.Mentor.update({email: email}, {
      email: email,
      classifications: classifications
    }, {
      upsert: true
    }, function(err) {
      if (err) return handleMongooseError(err, res, next);
      res.send(200, {message: "updated"});
    });
};

exports.submit = function(req, res, next) {
  var submission = new models.Submission(req.body);
  submission.save(function(err, submission) {
    if (err) return handleMongooseError(err, res, next);
    return res.send(201, {
      id: submission._id.toString()
    });
  });
};
