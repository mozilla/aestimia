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

  it('should mount static test dir if debug is set', function(done) {
    var debugApp = buildApp({
      debug: true
    });
    request(debugApp)
      .get('/test/')
      .expect(200, done);
  });

  it('should not mount static test dir if debug is unset', function(done) {
    request(app)
      .get('/test/')
      .expect(404, done);    
  });

  it('should enable HSTS if protocol is HTTPS', function(done) {
    var httpsApp = buildApp({
      personaAudience: 'https://foo.org'
    });
    request(httpsApp)
      .get('/')
      .expect('Strict-Transport-Security',
              'max-age=31536000; includeSubDomains', done);
  });

  it('should not enable HSTS if protocol is HTTP', function(done) {
    request(app)
      .get('/').end(function(err, res) {
        if (err) return done(err);
        if ('strict-transport-security' in res.headers)
          throw new Error('HSTS header exists!');
        done();
      });
  });

  it('should not allow itself to be embedded in iframes', function(done) {
    request(app)
      .get('/')
      .expect('X-Frame-Options', 'DENY', done)
  });

  it('should prevent IE from performing content sniffing', function(done) {
    request(app)
      .get('/')
      .expect('X-Content-Type-Options', 'nosniff', done)
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
