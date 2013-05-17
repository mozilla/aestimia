var mongoose = require('mongoose');

var connected = false;

const TESTDB_URL = 'mongodb://localhost/test';

exports.init = function() {
  if (!connected) {
    mongoose.connect(TESTDB_URL, function(err) {
      if (err) {
        console.error('Failed to connect to ' + TESTDB_URL + '.');
        console.log(err.stack);
        process.exit(1);
      }
    });
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
