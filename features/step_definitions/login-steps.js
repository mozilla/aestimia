var assert = require('assert');

var fiberize = require('../../test/acceptance').fiberize;

module.exports = fiberize(function() {
  this.When(/^a Mentor logs in to Aestimia$/, function() {
    this.browser.get(this.url('/'));
    this.answerNextPromptWith('john@mentors.org');
    this.browser.elementByCss('.btn.js-login').click();
    this.browser.waitForElementByLinkText('Logout', 15000);
  });

  this.When(/^there are no submissions for them to review$/, function() {
    // No need to do anything, there are no submissions by default.
  });

  this.Then(/^they should see the text "([^"]*)"$/, function(text) {
    assert(this.browser.textPresent(text, null),
           "text " + JSON.stringify(text) + " should be on page");
  });
});
