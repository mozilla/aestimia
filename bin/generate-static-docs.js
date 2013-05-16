var spawn = require('child_process').spawn;
var aestimia = require('../');

if (process.argv.length < 3) {
  console.log("usage: generate-static-docs.js <output-dir>");
  process.exit(1);
}

var outdir = process.argv[2];

var git = spawn('git', ['rev-parse', 'HEAD'], {cwd: __dirname + '/..'});
var hash = "";
git.stdout.setEncoding('utf8');
git.stdout.on('data', function(data) { hash += data; });
git.on('exit', function() {
  hash = hash.trim();
  if (!hash.match(/^[a-f0-9]+$/)) hash = null;

  aestimia.documentation.generateStaticDocs(outdir, hash);

  console.log("Generated static docs in " + outdir + "/.");
});
