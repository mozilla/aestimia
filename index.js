module.exports = process.env.AESTEMIA_COV
  ? require('./lib-cov/aestemia')
  : require('./lib/aestemia');
