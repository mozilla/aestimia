REPORTER=spec

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER) --check-leaks

test-cov: lib-cov
	@AESTEMIA_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

clean:
	rm -f coverage.html
	rm -rf lib-cov

.PHONY: test clean
