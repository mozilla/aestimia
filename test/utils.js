var aestimia = require('../');

exports.buildApp = function buildApp(options) {
  options = options || {};
  if (!options.cookieSecret) options.cookieSecret = 'testing';
  if (!options.personaAudience)
    options.personaAudience = 'http://foo.bar';
  return aestimia.app.build(options);
};
