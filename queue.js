const sqs = require('sqs');
const config = require('./config');

module.exports = sqs({
  access:config.SQS_ACCESS_KEY,
  secret:config.SQS_SECRET_KEY,
  region:config.SQS_REGION
});

module.exports.sqs = sqs;
module.exports.read_from = config.READ_QUEUE;
module.exports.write_to = config.WRITE_QUEUE;
