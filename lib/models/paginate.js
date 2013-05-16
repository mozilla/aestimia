var assert = require('assert');

var _ = require('underscore');
var async = require('async');

var Model = require('mongoose').Model;

Model.paginate = function(options, cb) {
  options.page = parseInt(options.page);
  options.resultsPerPage = parseInt(options.resultsPerPage);

  assert(options.page > 0, "page must be positive");
  assert(options.resultsPerPage > 0, "resultsPerPage must be positive");

  var model = this;
  var criteria = options.criteria;
  var resultsPerPage = options.resultsPerPage;
  var queryOptions = _.extend({}, options.options, {
    skip: (options.page-1) * resultsPerPage,
    limit: resultsPerPage
  });

  async.waterfall([
    function(done) {
      model.find(criteria).setOptions(queryOptions).exec(done)
    },
    function(results, done) {
      model.count(criteria).exec(function(err, count) {
        var totalPages = Math.ceil(count / resultsPerPage);
        done(err, results, totalPages);
      });
    }
  ], cb);
};

module.exports = Model.paginate;
