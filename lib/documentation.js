var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var nunjucks = require('nunjucks');

var data = require('../test/data');
var paths = require('./paths');

// This is synchronous, which is bad, but it's only called from
// the API documentation pages, which will only get hit by
// developers.
exports.parseRawApiSections = function parseRawApiSections() {
  var docs = fs.readFileSync(paths.fromRoot('doc', 'api-raw.html'),
                             'utf8');
  var $ = cheerio.load(docs);
  var sections = [];

  $("section").each(function() {
    var title = $(this).find("h2").remove();
    var template = new nunjucks.Template($(this).html());

    sections.push({
      title: title.text(),
      id: $(this).attr('id'),
      html: template.render({examples: data.docExamples})
    });
  });

  return sections;
};

function copyAndRewrite(query, srcAttr, outdir) {
  var src = query.attr(srcAttr);
  var fullPath = path.join(paths.staticDir, src);
  var filename = src.split('/').slice(-1)[0];
  var content = fs.readFileSync(fullPath);

  fs.writeFileSync(path.join(outdir, filename), content);
  query.attr(srcAttr, filename);  
}

exports.generateStaticDocs = function(outdir, commitHash) {
  var loaders = [
    new nunjucks.FileSystemLoader(paths.fromRoot('doc')),
    new nunjucks.FileSystemLoader(paths.viewsDir)
  ];
  var env = new nunjucks.Environment(loaders, {autoescape: true});
  var content = env.render('docs.html', {
    sections: exports.parseRawApiSections(),
    generatingStaticDocs: true,
    commitHash: commitHash
  });
  var $ = cheerio.load(content);

  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir);

  $('script').each(function() {
    copyAndRewrite($(this), "src", outdir);
  });
  $('link[rel="stylesheet"]').each(function() {
    copyAndRewrite($(this), "href", outdir);
  });
  fs.writeFileSync(path.join(outdir, "index.html"), $.html());
};
