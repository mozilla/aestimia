var _ = require('underscore');
var request = require('supertest');
var should = require('should');
var cheerio = require('cheerio');

var buildApp = require('./utils').buildApp;

describe('Themes', function() {
  var themeDir = __dirname + '/example-theme';
  var app = buildApp({
    themeDir: themeDir,
    defineExtraRoutes: function(app) {
      app.get('/theme-root', function(req, res, next) {
        res.send(app.locals.THEME_ROOT);
      });
    }
  });

  function render(view, ctxOptions) {
    var ctx = _.extend({
      messages: function() { return []; }
    }, ctxOptions || {});
    return cheerio.load(app.nunjucksEnv.render(view, ctx));
  }

  it('have their static dir mounted', function(done) {
    request(app)
      .get('/theme/example.txt')
      .expect('this is an example static file.')
      .expect(200, done);
  });

  it('have access to THEME_ROOT variable', function(done) {
    request(app)
      .get('/theme-root')
      .expect('/theme/')
      .expect(200, done);
  });

  it('can add to app.locals via app-locals.json', function() {
    app.locals.EXAMPLE.should.eql('example app local');
  });

  it('can override theme_head', function() {
    render('example.html')('meta[name="example-theme-meta"]')
      .attr("content").should.eql("hai2u");
  });

  it('can override theme_footer', function() {
    render('example.html')('#example-footer')
      .text().should.eql("Hallo.");
  });

  it('can inherit base layout', function() {
    render('example.html', {APP_NAME: 'Blargh'})('title')
      .text().should.eql("Blargh");
  });

  it('are applied to existing views', function() {
    render('splash.html')('meta[name="example-theme-meta"]')
      .attr("content").should.eql("hai2u");
  });
});
