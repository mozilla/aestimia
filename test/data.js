var _ = require('underscore');

var baseSubmissionObj = {
  learner: "brian@example.org",
  criteriaUrl: "http://seriouscat.com/",
  achievement: {
    name: "Tropical Koala Badge",
    description: "Awarded to Tropical Koalas.",
    imageUrl: "http://labs.toolness.com/catbadge.png"
  },
  classifications: ["science", "math"],
  evidence: [
    {
      url: "http://seriouscat.com/serious_cat_is_serious.jpg",
      reflection: "This shows how great I did."
    },
    {
      url: "https://mozorg.cdn.mozilla.net/media/img/home/firefox.png"
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

var baseSubmission = function(extra) {
  var attrs = JSON.parse(JSON.stringify(baseSubmissionObj));

  if (typeof(extra) == "function") {
    extra(attrs);
  } else if (typeof(extra) == "object") {
    _.extend(attrs, extra);
  }

  return attrs;
};

exports.submissions = {
  'base': baseSubmission(),
  'canned-responses': baseSubmission({
    cannedResponses: [
      "This is awesome",
      "This kind of sucks",
      "You didn't satisfy all criteria"
    ],
  })
};

exports.baseSubmission = baseSubmission;
