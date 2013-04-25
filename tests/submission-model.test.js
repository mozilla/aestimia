const test = require('./');
const Submission = require('../models').Submission;

var fixtures = require('./submission-model.fixtures.js');
test.applyFixtures(fixtures, function() {
  test('Submission simple grab', function(t) {
    Submission.findOne({learner:'chris@cooldude.com'}, 
                    function(error, submission) {
                      t.notOk(error, "shouldn't return an error");
                      t.same(submission.criteriaUrl, 'http://cooldudes.com/howto.html', "chris is a cool dude");
                    });
    t.end();
  });
});
