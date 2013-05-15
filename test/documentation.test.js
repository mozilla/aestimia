var should = require('should');

var docs = require('../').documentation;

describe('documentation utils', function() {
  it('should parse raw api doc sections', function() {
    var sections = docs.parseRawApiSections();

    sections[0].id.should.eql('overview');
    sections[0].title.should.eql('Overview');
    sections[0].html.should.match(/api/i);
    sections[0].html.should.not.match(/<h2>/i);
  });
});
