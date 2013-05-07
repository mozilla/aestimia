var should = require('should');
var request = require('supertest');

describe('App', function() {
  var app = require('../').app.build({
    cookieSecret: 'testing'
  });

  it('should return 200 OK at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });
});
