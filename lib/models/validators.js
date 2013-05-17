exports.validEmail = [
  function(email) {
    // Apparently using a regexp to do anything more strict than this
    // is hard: http://stackoverflow.com/a/201378
    return /^([^@]+)@([^@]+)$/.test(email);
  },
  "email must be of form user@host"
];

exports.safeUrl = [function(url) { return /^https?:\/\//.test(url); },
                   "url must be http or https"];

exports.validMediaType = [
  function(value) {
    return ['image', 'link'].indexOf(value) != -1;
  },
  'invalid media type'
];
