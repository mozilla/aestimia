const test = require('./');
const Submission = require('../models').Submission;

var fixtures = require('./submission-model.fixtures.js');
test.applyFixtures(fixtures, function() {
  test('Submission simple grab', function(t) {
    Submission.find({learner:'chris@cooldude.com'}, 
                    function(s) {
                      t.same(s.learner, 'chris@cooldude.com', "chris is a cool dude");
                    });
    t.end();
  });
});
