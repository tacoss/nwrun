module.exports = {
  '@tags': ['yahoo'],
  'Demo test Yahoo' : function (browser) {
    browser
      .url('http://yahoo.com')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'nightwatch js')
      .waitForElementVisible('#search-submit', 1000)
      .click('#search-submit')
      .pause(1000)
      .assert.containsText('#main', 'beatfactor/nightwatch')
      .end();
  }
};
