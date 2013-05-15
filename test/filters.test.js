var nunjucks = require('nunjucks');
var SafeString = require('nunjucks/src/runtime').SafeString;
var should = require('should');

var filters = require('../').filters;

describe("filter", function() {
  var env = new nunjucks.Environment();
  env.addFilter('timeago', filters.timeago);

  describe("timeago", function() {
    var date = new Date("Wed May 15 2013 10:53:40 GMT-0400 (EDT)");

    it("should return a SafeString", function() {
      env.filters.timeago(date).should.be.instanceOf(SafeString);
    });

    it("should return a <time> element", function() {
      var html = "<time class=\"timeago\" " +
                 "datetime=\"2013-05-15T14:53:40.000Z\">" +
                 "Wed, 15 May 2013 14:53:40 GMT</time>";
      env.filters.timeago(date).toString().should.eql(html);
    });
  });
});
