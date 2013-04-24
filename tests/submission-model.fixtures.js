const models = require('../models')
const Submission = models.Submission

module.exports = {
  'submission-basic': new Submission({
    learner: 'chris@cooldude.com',
    criteriaUrl: 'http://cooldudes.com/howto.html',
    classification: ['cooldudes'],
    evidence: [
      { url: 'http://chrisiscool.com/evidence.html',
        reflection: 'I am fairly certain I am cool'
      }
    ]
  })
}
    
    
