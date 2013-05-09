var request = require('supertest');

var buildApp = require('./utils').buildApp;

describe('Website', function() {
  var app = buildApp({
    defineExtraRoutes: function(app) {
      app.get('/test-make-flash-message', function(req, res) {
        req.flash('info', '<em>hi</em>');
        return res.render('layout.html');
      });      
    }
  });

  it('should return 200 OK with HTML at /', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200, done);    
  });

  it('should show flash messages', function(done) {
    request(app)
      .get('/test-make-flash-message')
      .expect(/class="alert alert-info"/)
      .expect(/<em>hi<\/em>/)
      .expect(200, done);
  });

  it('should include CSRF tokens in pages', function(done) {
    request(app)
      .get('/')
      .expect(/name="csrf" content="[A-Za-z0-9\-_]+"/)
      .expect(200, done);
  });
});
