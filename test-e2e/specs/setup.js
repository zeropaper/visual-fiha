var expect = require('expect.js');
describe('Visual Fiha', function() {
  beforeEach(function() {
    console.info('beforeEach');
    browser.url('http://localhost:8081/controller.html#env=test');
  });

  it('has a title', function () {
    var title = browser.getTitle();
    expect(title).to.be('Controller | Visual Fiha');
  });

  describe('audio source', function() {
    it('saves the settings changes', function() {
      var tabs = browser.element('.region-left-bottom .region-tabs');
      var content = browser.element('.region-left-bottom .region-content');
      console.info('content', content);

      tabs.click('=Audio');
      // content.selectByValue('[name="fftSize"]', 32);
      tabs.click('=Mappings');
      tabs.click('=Audio');
    });
  });
});