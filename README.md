[![Build Status](https://travis-ci.org/mozilla/aestimia.png)](https://travis-ci.org/mozilla/aestimia)

Aestimia allows a mentor community to assess work based on submitted
evidence and a rubric.

## Prerequisites

You'll need node 0.8 or 0.10.

[PhantomJS][] is required to run the test suite.

## Quick Start

    git clone git://github.com/mozilla/aestimia.git
    cd aestimia
    npm install
    npm test
    DEBUG= COOKIE_SECRET=supersecret node bin/aestimia.js

When deploying, you'll want to set `COOKIE_SECRET` to something super
secret. See [bin/aestimia.js][] for more configuration options.

  [PhantomJS]: http://phantomjs.org/
  [bin/aestimia.js]: https://github.com/mozilla/aestimia/blob/master/bin/aestimia.js
