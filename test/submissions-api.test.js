const conmock = require('./conmock');
const test = require("tap").test;
const submissions = require('../controllers/submissions/submissions');

test("POST something to submission, get something back", function(t) {
  conmock(submissions.create, function(err, mock) {
    t.same(mock.status, 200, 'you can create something');
    t.same(mock.body, '12345');
  })
  t.end();
});

test("GET a submission", function(t) {
  conmock({ handler: submissions.get, 
            request: {id:'12345'} 
          },
          function(err, mock) {
            t.same(mock.status, 200, 'you can get something');
            t.same(mock.body, 'information about 12345');
          })
  t.end();
})


