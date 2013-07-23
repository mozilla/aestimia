[![Build Status](https://travis-ci.org/mozilla/aestimia.png)](https://travis-ci.org/mozilla/aestimia)

Aestimia allows a mentor community to assess work based on submitted
evidence and a rubric.

## Prerequisites

You'll need node 0.8, as well as [MongoDB][].

[PhantomJS][] 1.8 or later is required to run the test suite. MongoDB is
expected to be available on localhost at the default port while the test
suite is running, too; the `test` database will be used.

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

## Environment Variables

* `COOKIE_SECRET` is the secret used to encrypt and sign cookies,
  to prevent tampering.

* `API_SECRET` is the secret used to make API requests to
  Aestimia. If absent, the API is disabled. API documentation
  can be found at `/docs` once Aestimia has launched.

* `PERSONA_AUDIENCE` is the origin of the server, as it appears
  to users. If `DEBUG` is enabled, this defaults to
  `http://localhost:PORT`. Otherwise, it must be defined.

* `MONGO_URL` is the URL to the MongoDB instance. If this isn't
  present, the app looks at `MONGOHQ_URL`, followed by
  `MONGOLAB_URI`. If none of these are present, the default value,
  `mongodb://localhost/aestimia`, is used.

* `DEBUG` represents a boolean value: if the variable exists
  with any value (even the empty string), the boolean is true,
  otherwise it's false. Setting this to true makes the server
  use unminified source code on the client-side, among other
  things.

* `ENABLE_STUBBYID`, like `DEBUG`, represents a boolean value.
  If it *and* `DEBUG` are both true, then the [stubbyid][] persona
  simulator is enabled. This allows anyone to easily log in as
  anyone they want, which makes manual testing and debugging easier.
  However, it should also *never* be enabled on production sites,
  which is why `DEBUG` must also be enabled for this feature to work.

* `THEME_DIR` is the path to a theme. Any relative paths are resolved
  based on the root directory of Aestimia. Thus setting
  `THEME_DIR` to `theme/csol` would activate the Chicago Summer of
  Learning theme.

* `PORT` is the port that the server binds to. Defaults to 3000.

* `SSL_KEY` is the path to a private key to use for SSL. If this
  is provided, the server must be accessed over HTTPS rather
  than HTTP, and the `SSL_CERT` environment variable must also
  be defined.

* `SSL_CERT` is the path to a SSL certificate. If this
  is provided, the server must be accessed over HTTPS rather
  than HTTP, and the `SSL_KEY` environment variable must also
  be defined.

## API

Submissions and mentor management are accessible over an API.
If you have an instance of Aestimia running, interactive API
documentation is available at `/demo`. Otherwise, you can still
read the [static documentation][].

## Themes

Aestimia looks like generic [Bootstrap][] out of the box, but it
can be themed. See `theme/csol` for an example.

To enable a theme, set the `THEME_DIR` environment variable to
the root directory of the theme; see above for more details.

## Acceptance Tests

Acceptance tests are automatically run with `npm test`. Their behavior
can be changed by the following environment variables:

* `ACCEPTANCE_DEBUG` represents a boolean value. If it exists, logging
  output will be displayed that makes the tests easier to debug.

* `ACCEPTANCE_BROWSER_NAME` is the name of the browser to use when
  running the acceptance tests. If this is `phantom` (the default), phantomjs
  is automatically started and used for browser automation. Otherwise, it's
  assumed that a [WebDriver][] server is hosted at port 4444 and the
  `browserName` capability is set to this environment variable.

## Test Coverage

Build/install [jscoverage][], run `make test-cov`, then open
`coverage.html` in a browser.

Coverage should always be at [100%][]. Pull requests that break this will
be rejected.

  [stubbyid]: http://toolness.github.io/stubbyid/
  [static documentation]: http://mozilla.github.io/aestimia/
  [Bootstrap]: http://twitter.github.io/bootstrap/
  [MongoDB]: http://www.mongodb.org/
  [PhantomJS]: http://phantomjs.org/
  [bin/aestimia.js]: https://github.com/mozilla/aestimia/blob/master/bin/aestimia.js
  [jscoverage]: https://github.com/visionmedia/node-jscoverage
  [100%]: http://labs.toolness.com/temp/aestimia-coverage.html
  [WebDriver]: http://docs.seleniumhq.org/projects/webdriver/
