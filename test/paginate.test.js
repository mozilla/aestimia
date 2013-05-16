var mongoose = require('mongoose');
var async = require('async');
var should = require('should');

var paginate = require('../').models.paginate;
var db = require('./db');

db.init();

describe("Model.paginate", function() {
  var thingusSchema = new mongoose.Schema({name: String});
  var Thingus = mongoose.model('Thingus', thingusSchema);

  before(function(done) {
    Thingus.remove({}, function(err) {
      if (err) throw err;
      async.each(['foo', 'bar', 'baz', 'qux'], function(name, cb) {
        var thingus = new Thingus({name: name});
        thingus.save(cb);
      }, done);
    });
  });

  it("should return page 1 w/ perfect page fitting", function(done) {
    Thingus.paginate({
      criteria: {}, 
      options: {sort: 'name'},
      page: 1,
      resultsPerPage: 2
    }, function(err, results, totalPages) {
      if (err) return done(err);
      results.length.should.eql(2);
      results.map(function(r) { return r.name; }).should.eql(['bar', 'baz']);
      totalPages.should.eql(2);
      done();
    });
  });

  it("should return page 2 w/ perfect page fitting", function(done) {
    Thingus.paginate({
      criteria: {}, 
      options: {sort: 'name'},
      page: 2,
      resultsPerPage: 2
    }, function(err, results, totalPages) {
      if (err) return done(err);
      results.length.should.eql(2);
      results.map(function(r) { return r.name; }).should.eql(['foo', 'qux']);
      totalPages.should.eql(2);
      done();
    });
  });

  it("should return empty result if page # out of bounds", function(done) {
    Thingus.paginate({
      criteria: {}, 
      options: {sort: 'name'},
      page: 50,
      resultsPerPage: 2
    }, function(err, results, totalPages) {
      if (err) return done(err);
      results.length.should.eql(0);
      totalPages.should.eql(2);
      done();
    });
  });

  it("should round up # of pages if fit isn't perfect", function(done) {
    Thingus.paginate({
      criteria: {}, 
      options: {sort: 'name'},
      page: 2,
      resultsPerPage: 3
    }, function(err, results, totalPages) {
      if (err) return done(err);
      results.length.should.eql(1);
      totalPages.should.eql(2);
      done();
    });
  });
});
