const sqs = require('sqs');
const config = require('./config');

var queue = sqs({
  access:config.SQS_ACCESS_KEY,
  secret:config.SQS_SECRET_KEY,
  region:config.SQS_REGION
});

queue.sqs = sqs;
queue.readFrom = config.READ_QUEUE;
queue.writeTo = config.WRITE_QUEUE;

module.exports = queue;
