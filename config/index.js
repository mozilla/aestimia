var config = {
  SQS_ACCESS_KEY:process.env.SQS_ACCESS_KEY,
  SQS_SECRET_KEY:process.env.SQS_SECRET_KEY,
  SQS_REGION:process.env.SQS_REGION,
  READ_QUEUE:process.env.READ_QUEUE,
  WRITE_QUEUE:process.env.WRITE_QUEUE
}

if (process.env.NODE_ENV == 'test') {
  config.MONGO_HOST=process.env.TEST_MONGO_HOST;
  config.exports.MONGO_DB=process.env.TEST_MONGO_DB;
} else {
  config.MONGO_HOST=process.env.MONGO_HOST;
  config.MONGO_DB=process.env.MONGO_DB;
};

module.exports = config;
