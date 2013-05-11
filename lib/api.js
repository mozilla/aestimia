var models = require('./models');

// TODO: Add API endpoint to get status of assessments for a learner.
// TODO: Allow API clients to specify webhooks for badge actions?

function handleMongooseError(err, res, next) {
  if (err.name == "ValidationError") {
    res.send(400, makeConciseValidationError(err));
  } else if (err.name == "CastError") {
    res.send(400, {message: err.message});
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
    return res.send(400, "need valid email");

  if (!classifications || !classifications.length)
    models.Mentor.remove({email: email}, function(err) {
      if (err) return handleMongooseError(err, res, next);
      res.send(200, "deleted");
    });
  else
    models.Mentor.update({email: email}, {
      email: email,
      classifications: classifications
    }, {
      upsert: true
    }, function(err) {
      if (err) return handleMongooseError(err, res, next);
      res.send(200, "updated");
    });
};

exports.submit = function(req, res, next) {
  var submission = new models.Submission(req.body);
  submission.save(function(err, submission) {
    if (err) return handleMongooseError(err, res, next);
    return res.send({
      id: submission._id.toString()
    });
  });
};
