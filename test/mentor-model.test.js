var mongoose = require('mongoose');
var async = require('async');
var should = require('should');

var Mentor = require('../').models.Mentor;

function newMentor(obj) {
  return function(cb) {
    var m = new Mentor(obj);
    m.save(cb);
  };
}

function ensureClassificationsFor(email, expected) {
  return function(cb) {
    Mentor.classificationsFor(email, function(err, classifications) {
      if (err) return cb(err);
      classifications.should.eql(expected);
      cb(null);
    });
  };
}

mongoose.connect('mongodb://localhost/test');

describe('Mentor', function() {
  it('should have a uniqueness constraint on email addrs', function(done) {
    async.series([
      Mentor.remove.bind(Mentor),
      newMentor({
        email: 'foo@bar.org',
        classifications: ['a', 'b']
      }),
      newMentor({
        email: 'foo@bar.org',
        classifications: ['lol', 'cat']
      }),
    ], function(err) {
      err.code.should.eql(11000); // duplicate key error
      done();
    });
  });
});

describe('Mentor.classificationsFor()', function() {
  it('should report union of user and domain classes', function(done) {
    async.series([
      Mentor.remove.bind(Mentor),
      newMentor({
        email: 'foo@bar.org',
        classifications: ['a', 'b', 'lol']
      }),
      newMentor({
        email: '*@bar.org',
        classifications: ['lol', 'cat']
      }),
      ensureClassificationsFor('foo@bar.org', ['a', 'b', 'lol', 'cat'])
    ], done);
  });

  it('should report domain classifications', function(done) {
    async.series([
      Mentor.remove.bind(Mentor),
      newMentor({
        email: '*@bar.org',
        classifications: ['lol', 'cat']
      }),
      ensureClassificationsFor('foo@bar.org', ['lol', 'cat'])
    ], done);
  });

  it('should report user classifications', function(done) {
    async.series([
      Mentor.remove.bind(Mentor),
      newMentor({
        email: 'foo@bar.org',
        classifications: ['a', 'b']
      }),
      ensureClassificationsFor('foo@bar.org', ['a', 'b'])
    ], done);
  });
});