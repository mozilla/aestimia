var path = require('path');

var fromRoot = exports.fromRoot = function fromRoot() {
  var fullPath = path.join.apply(this, arguments);
  return path.resolve(__dirname + '/..', fullPath);
};

exports.viewsDir = fromRoot('views');
exports.staticDir = fromRoot('static');
exports.staticTestDir = fromRoot('test', 'browser');
