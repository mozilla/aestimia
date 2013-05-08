var _ = require('underscore');
var mongoose = require('mongoose');

var mentorSchema = new mongoose.Schema({
  username: String,
  domain: {type: String, required: true},
  classifications: [String]
});

var Mentor = mongoose.model('Mentor', mentorSchema);

Mentor.classificationsFor = function classificationsFor(email, cb) {
  var parts = email.split('@');
  var username = parts[0];
  var domain = parts[1];
  Mentor.findOne({
    username: username,
    domain: domain
  }, function(err, mentor) {
    if (err) return cb(err);
    var userClassifications = mentor ? mentor.classifications : [];
    Mentor.findOne({
      username: null,
      domain: domain
    }, function(err, mentor) {
      if (err) return cb(err);
      var domainClassifications = mentor ? mentor.classifications : [];
      cb(null, _.union(userClassifications, domainClassifications));
    });
  });
};

module.exports = Mentor;
