module.exports = {
  SQS_ACCESS_KEY:process.env.SQS_ACCESS_KEY,
  SQS_SECRET_KEY:process.env.SQS_SECRET_KEY,
  SQS_REGION:process.env.SQS_REGION,
  READ_QUEUE:process.env.READ_QUEUE,
  WRITE_QUEUE:process.env.WRITE_QUEUE
}

if (process.env.NODE_ENV == 'test') {
  module.exports.MONGO_HOST=process.env.TEST_MONGO_HOST;
  module.exports.MONGO_DB=process.env.TEST_MONGO_DB;
} else {
  module.exports.MONGO_HOST=process.env.MONGO_HOST;
  module.exports.MONGO_DB=process.env.MONGO_DB;
};
