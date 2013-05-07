module.exports = process.env.AESTEMIA_COV
  ? require('./lib-cov/aestimia')
  : require('./lib/aestimia');
