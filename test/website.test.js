var request = require('supertest');

var buildApp = require('./utils').buildApp;

describe('Website', function() {
  var app = buildApp();

  it('should return 200 OK at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });
});
