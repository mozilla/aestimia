[![Build Status](https://travis-ci.org/mozilla/aestimia.png)](https://travis-ci.org/mozilla/aestimia)

Aestimia allows a mentor community to assess work based on submitted
evidence and a rubric.

## Prerequisites

You'll need node 0.8, as well as [MongoDB][].

[PhantomJS][] is required to run the test suite. MongoDB is expected
to be available on localhost at the default port while the test suite is
running, too; the `test` database will be used.

## Quick Start

    git clone git://github.com/mozilla/aestimia.git
    cd aestimia
    npm install
    npm test
    DEBUG= API_SECRET=api COOKIE_SECRET=cookie node bin/aestimia.js

By default, the `aestimia` database on the local mongo instance is used.

Once the server has started, you'll probably want to visit
http://localhost:3000/demo and enter `api` (or whatever your `API_SECRET`
is set to) in the *API Secret* field.

Then, add yourself as a mentor from the *Update a mentor* section, and
create a submission in the *Create a submission* section. Log in as
yourself via Persona, go back to the site root, and you should see
the submission there waiting for you to review.

## Themes

Aestimia looks like generic [Bootstrap][] out of the box, but it
can be themed. See `theme/csol` for an example.

To enable a theme, set the `THEME_DIR` environment variable to
the root directory of the theme. Any relative paths are resolved
based on the root directory of Aestimia. Thus setting
`THEME_DIR` to `theme/csol` would activate the Chicago Summer of
Learning theme.

## Deployment

When deploying, you'll want to set `COOKIE_SECRET` and `API_SECRET` to
something super secret. See [bin/aestimia.js][] for more configuration
options.

## Test Coverage

Build/install [jscoverage][], run `make test-cov`, then open
`coverage.html` in a browser.

Coverage should always be at [100%][]. Pull requests that break this will
be rejected.

  [Bootstrap]: http://twitter.github.io/bootstrap/
  [MongoDB]: http://www.mongodb.org/
  [PhantomJS]: http://phantomjs.org/
  [bin/aestimia.js]: https://github.com/mozilla/aestimia/blob/master/bin/aestimia.js
  [jscoverage]: https://github.com/visionmedia/node-jscoverage
  [100%]: http://labs.toolness.com/temp/aestimia-coverage.html
