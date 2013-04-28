const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'views')));
env.express(app);

app.use(express.logger());
app.use(express.compress());
app.use(express.bodyParser());
app.use('/static', express.static(path.join(__dirname, 'static')));

require('./controllers/submissions')(app);

if (!module.parent) {
  var port = process.env.PORT || 3000;
  console.log("starting app server on " + port);
  app.listen(port);
} else {
  module.exports = http.createServer(app);
}
