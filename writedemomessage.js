// writes a message to the queue...for testing
// I promise to convert this to nock
const queue = require('queue');
const write = queue.read_from;

for(var i = 0; i < 10; i++) {
  console.log(i);
  queue.push(write, {
    learner:'chris@mozillafoundation.org',
    criteria:'http://lonelylion.com',
    classification: ['chris','cooldude']
  });
}
