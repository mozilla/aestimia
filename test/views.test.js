var should = require('should');
var cheerio = require('cheerio');
var nunjucks = require('nunjucks');
var _ = require('underscore');

var loader = new nunjucks.FileSystemLoader(__dirname + '/../views');
var env = new nunjucks.Environment(loader, {autoescape: true});

function render(view, ctxOptions) {
  var ctx = _.extend({
    messages: function() { return []; }
  }, ctxOptions || {});
  return cheerio.load(env.render(view, ctx));
}

describe('views/', function() {
  describe('layout.html', function() {
    it('should embed email in a meta tag', function() {
      var $ = render('layout.html', {email: 'a@b.org'});
      $('meta[name="email"]').attr("content").should.eql('a@b.org');
    });

    it('should embed CSRF in a meta tag', function() {
      var $ = render('layout.html', {csrfToken: 'sup'});
      $('meta[name="csrf"]').attr("content").should.eql('sup');
    });

    it('should show logout link when user is logged in', function() {
      var $ = render('layout.html', {email: 'u'});
      $('.js-logout').text().should.eql('Logout');
      $('.js-login').length.should.eql(0);
    });

    it('should show login button when user is logged out', function() {
      var $ = render('layout.html');
      $('.js-login').text().should.eql('Login');
      $('.js-logout').length.should.eql(0);
    });

    it('should show alert messages', function() {
      var $ = render('layout.html', {
        messages: function() { return [{
          category: 'victory',
          html: '<em>you win!</em>'
        }] }
      });
      $('.alert.alert-victory').length.should.eql(1);
      $('.alert.alert-victory em').text().should.eql('you win!');
    });

    
  });
});
