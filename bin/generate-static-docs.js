var aestimia = require('../');

if (process.argv.length < 3) {
  console.log("usage: generate-static-docs.js <output-dir>");
  process.exit(1);
}

var outdir = process.argv[2];

aestimia.documentation.generateStaticDocs(outdir);

console.log("Generated static docs in " + outdir + "/.");
