var db = require('./db');
var async = require('async');
var should = require('should');

var Mentor = require('../').models.Mentor;

db.init();

function ensureClassificationsFor(email, expected) {
  return function(cb) {
    Mentor.classificationsFor(email, function(err, classifications) {
      if (err) return cb(err);
      classifications.should.eql(expected);
      cb(null);
    });
  };
}

describe('Mentor', function() {
  it('should have a uniqueness constraint on email addrs', function(done) {
    async.series([
      db.removeAll(Mentor),
      db.create(Mentor, {
        email: 'foo@bar.org',
        classifications: ['a', 'b']
      }),
      db.create(Mentor, {
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
      db.removeAll(Mentor),
      db.create(Mentor, {
        email: 'foo@bar.org',
        classifications: ['a', 'b', 'lol']
      }),
      db.create(Mentor, {
        email: '*@bar.org',
        classifications: ['lol', 'cat']
      }),
      ensureClassificationsFor('foo@bar.org', ['a', 'b', 'lol', 'cat'])
    ], done);
  });

  it('should report domain classifications', function(done) {
    async.series([
      db.removeAll(Mentor),
      db.create(Mentor, {
        email: '*@bar.org',
        classifications: ['lol', 'cat']
      }),
      ensureClassificationsFor('foo@bar.org', ['lol', 'cat'])
    ], done);
  });

  it('should report user classifications', function(done) {
    async.series([
      db.removeAll(Mentor),
      db.create(Mentor, {
        email: 'foo@bar.org',
        classifications: ['a', 'b']
      }),
      ensureClassificationsFor('foo@bar.org', ['a', 'b'])
    ], done);
  });
});