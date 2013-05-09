var _ = require('underscore');

var aestimia = require('../');

exports.buildApp = function buildApp(options) {
  options = options || {};
  if (!options.cookieSecret) options.cookieSecret = 'testing';
  return aestimia.app.build(options);
};

var baseSubmissionObj = {
  learner: "brian@example.org",
  criteriaUrl: "http://something.whatever.org",
  achievement: {
    name: "Tropical Koala Badge",
    description: "Awarded to Tropical Koalas.",
    imageUrl: "http://tropicalkoa.la/png"
  },
  classifications: ["science", "math"],
  evidence: [
    {
      url: "https://evidence.com/1",
      reflection: "This shows how great I did."
    },
    {
      url: "http://evidence.com/2"
    }
  ],
  rubric: {
    items: [
      { "required": true, "text": "Learner is a chill bro" },
      { "required": true, "text": "Learner isn't a jerk" },
      { "required": false, "text": "Learner can funnel like 80 beers" },
      { "required": false, "text": "Learner can even lift" }
    ]
  }
};

exports.baseSubmission = function(extra) {
  var attrs = JSON.parse(JSON.stringify(baseSubmissionObj));

  if (typeof(extra) == "function") {
    extra(attrs);
  } else if (typeof(extra) == "object") {
    _.extend(attrs, extra);
  }

  return attrs;
};
