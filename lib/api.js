var models = require('./models');

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

exports.submit = function(req, res, next) {
  var submission = new models.Submission(req.body);
  submission.save(function(err, submission) {
    if (err) {
      if (err.name == "ValidationError") {
        return res.send(400, makeConciseValidationError(err));
      } else if (err.name == "CastError") {
        return res.send(400, {message: err.message});
      } else {
        return next(err);
      }
    }
    return res.send({
      id: submission._id.toString()
    });
  });
};
