var aestimia = require('../');

exports.buildApp = function buildApp(options) {
  options = options || {};
  if (!options.cookieSecret) options.cookieSecret = 'testing';
  return aestimia.app.build(options);
};
