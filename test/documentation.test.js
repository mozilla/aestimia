var fs = require('fs');
var path = require('path');
var should = require('should');

var docs = require('../').documentation;

function nukeDir(tempdir) {
  if (fs.existsSync(tempdir)) {
    fs.readdirSync(tempdir).forEach(function(filename) {
      fs.unlinkSync(path.join(tempdir, filename));
    });
    fs.rmdirSync(tempdir);
  }
}

describe('documentation utils', function() {
  it('should parse raw api doc sections', function() {
    var sections = docs.parseRawApiSections();

    sections[0].id.should.eql('overview');
    sections[0].title.should.eql('Overview');
    sections[0].html.should.match(/api/i);
    sections[0].html.should.not.match(/<h2>/i);
  });

  it('should generate static docs', function() {
    var tempdir = path.join(__dirname, 'tempdocs');

    nukeDir(tempdir);
    docs.generateStaticDocs(tempdir);
    fs.existsSync(path.join(tempdir, 'index.html')).should.equal(true);
    nukeDir(tempdir);
  });
});
