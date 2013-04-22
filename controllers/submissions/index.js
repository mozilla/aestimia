const s = require('./submissions.js')

module.exports = function(app) {
  app.post('/submit', s.create)
  app.get('/submission/:id?', s.get)

 
  app.get('/submit', function(req, res, next) {
    res.send("you need to post");
  })
}
