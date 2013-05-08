var mongoose = require('mongoose');

var connected = false;

exports.init = function() {
  if (!connected) {
    mongoose.connect('mongodb://localhost/test');
    connected = true;
  }
};

exports.create = function(model, attributes) {
  return function(cb) {
    var m = new model(attributes);
    m.save(cb);
  };
};

exports.removeAll = function(model) {
  return model.remove.bind(model);
};
