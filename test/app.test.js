var should = require('should');
var request = require('supertest');
var sinon = require('sinon');

var buildApp = require('./utils').buildApp;

describe('App', function() {
  var app = buildApp({
    defineExtraRoutes: function(app) {
      app.get('/forced-error', function(req, res, next) {
        next(new Error('omg kaboom'));
      });
    }
  });

  it('should report errors', function(done) {
    sinon.stub(process.stderr, 'write');

    request(app)
      .get('/forced-error')
      .expect('Sorry, something exploded!')
      .expect(500, function(err) {
        process.stderr.write.calledWithMatch('omg kaboom').should.eql(true);
        process.stderr.write.restore();
        done(err);
      });
  });

  it('should protect non-api endpoints with CSRF', function(done) {
    request(app)
      .post('/blargy')
      .expect('Content-Type', 'text/plain')
      .expect('Forbidden')
      .expect(403, done);
  });

  it('should protect api endpoints when API is disabled', function(done) {
    request(app)
      .get('/api/foo')
      .expect('API access is disabled.')
      .expect(403, done);
  });

  it('should show flash messages', function(done) {
    app.get('/test-make-flash-message', function(req, res) {
      req.flash('info', '<em>hi</em>');
      return res.render('layout.html');
    });
    request(app)
      .get('/test-make-flash-message')
      .expect(/class="alert alert-info"/)
      .expect(/<em>hi<\/em>/)
      .expect(200, done);
  });

  it('should use content security policy', function(done) {
    request(app)
      .get('/')
      .expect('Content-Security-Policy', /'self'/, function(err, res) {
        if (err) return done(err);
        res.headers['content-security-policy']
          .should.not.match(/'unsafe-eval'/);
        done();
      });
  });

  it('should allow eval() at /test/', function(done) {
    request(app)
      .get('/test/')
      .expect('Content-Security-Policy', /'unsafe-eval'/, done);
  });

  it('should include CSRF tokens in pages', function(done) {
    request(app)
      .get('/')
      .expect(/name="csrf" content="[A-Za-z0-9\-_]+"/)
      .expect(200, done);
  });

  it('should serve static files', function(done) {
    request(app)
      .get('/vendor/jquery.js')
      .expect('Content-Type', /javascript/)
      .expect(200, done);
  });
});

describe('Nunjucks environment', function() {
  function FakeLoader(map) {
    return {
      getSource: function(name) {
        if (name in map) {
          return {
            src: map[name],
            path: name,
            upToDate: function() { return true; }
          };
        }
      }
    };
  }

  it('should autoescape', function(done) {
    var app = buildApp();
    app.nunjucksEnv.loaders.push(FakeLoader({
      'test_escaping.html': 'hi {{blah}}'
    }));
    app.get('/testing', function(req, res) {
      res.render('test_escaping.html', {blah: '<script>'});
    });
    request(app)
      .get('/testing')
      .expect('hi &lt;script&gt;')
      .expect(200, done);
  });
});
