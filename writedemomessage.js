// writes a message to the queue...for testing
// I promise to convert this to nock
const queue = require('queue');
const write = queue.readFrom;

for(var i = 0; i < 10; i++) {
  console.log(i);
  queue.push(write, {
    learner:'chris@mozillafoundation.org',
    criteria:'http://lonelylion.com',
    classification: ['chris','cooldude'],
    image: 'https://raw.github.com/mozilla/CSOL-site/gh-pages/img/chicago-badge.png',
    name: 'The Chicago Demo Badge',
    description: 'User demonstrates knowledge of Chicago History',
    evidence: [{url:'http://lonelylion.com', reflection:'I write about history'}],
    rubric: {
      minimum: 3,
      items: [
        {
        required: false,
        text: "must have show that they know wtf is up",
        }
      ]
    }
  });
}
