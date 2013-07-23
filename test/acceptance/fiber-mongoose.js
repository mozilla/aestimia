var mongoose = require('mongoose');
var Future = require('fibers/future');

var waitFor = exports.waitFor = function waitFor(obj, prop) {
  var f = new Future();
  obj[prop].apply(obj, [].slice.call(arguments, 2).concat([f.resolver()]));
  return f.wait();
};

mongoose.Model.prototype.saveAndWait = function() {
  waitFor(this, 'save');
  return this;
};
