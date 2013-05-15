var fs = require('fs');
var cheerio = require('cheerio');

// This is synchronous, which is bad, but it's only called from
// the API documentation pages, which will only get hit by
// developers.
exports.parseRawApiSections = function parseRawApiSections() {
  var docs = fs.readFileSync(__dirname + '/../doc/api-raw.html',
                             'utf8');
  var $ = cheerio.load(docs);
  var sections = [];

  $("section").each(function() {
    var title = $(this).find("h2").remove();
    sections.push({
      title: title.text(),
      id: $(this).attr('id'),
      html: $(this).html()
    });
  });

  return sections;
};
