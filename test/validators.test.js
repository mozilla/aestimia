var should = require('should');

var validators = require('../').models.validators;

describe('validator', function() {
  describe('validEmail', function() {
    var validEmail = validators.validEmail[0];

    it('should accept valid emails', function() {
      validEmail('foo@bar.org').should.equal(true);
      validEmail('foo+goofball@bar.org').should.equal(true);
    });

    it('should accept wildcard emails', function() {
      validEmail('*@bar.org').should.equal(true);
    });

    it('should reject invalid emails', function() {
      validEmail('foo@bar@lol.org').should.equal(false);
      validEmail('foo').should.equal(false);
    });
  });

  describe('safeUrl', function() {
    var safeUrl = validators.safeUrl[0];

    it('should accept http URLs', function() {
      safeUrl('http://lol.org/').should.equal(true);
    });

    it('should accept https URLs', function() {
      safeUrl('https://lol.org/').should.equal(true);
    });

    it('should reject javascript URLs', function() {
      safeUrl('javascript:alert()').should.equal(false);
    });
  });

  describe('validMediaType', function() {
    var validMediaType = validators.validMediaType[0];

    it('should accept known media types', function() {
      validMediaType('image').should.equal(true);
      validMediaType('link').should.equal(true);
    });

    it('should reject unknown media types', function() {
      validMediaType('lolcat').should.equal(false);
    });
  });
});
