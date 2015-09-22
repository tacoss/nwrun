module.exports = {
  '@tags': ['bing'],
  'Demo test Bing' : function (browser) {
    browser
      .url('http://bing.com')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=search]', 'Grupo Expansión')
      .waitForElementVisible('input[type=submit]', 1000)
      .click('input[type=submit]')
      .pause(1000)
      .assert.containsText('#b_results', 'grupoexpansion')
      .end();
  }
};
