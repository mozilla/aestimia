REPORTER=spec

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER) --check-leaks \
	  test/*.test.js

test-cov: lib-cov
	@AESTEMIA_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

clean:
	rm -f coverage.html
	rm -rf lib-cov

website:
	node bin/generate-static-docs.js gh-pages
	git checkout gh-pages
	mv gh-pages/* .
	rmdir gh-pages
	git add *.html *.js *.css
	echo "run 'git commit' to commit changes to site, then push to github."

.PHONY: test clean
