const axios = require("axios");
const utils = require("./utils");
async function run() {
  const browser = await utils.getPuppeteerBrowser();
  const page = await browser.newPage();
  async function waitThenGetElement(selector, unique) {
    await page.waitForSelector(selector, { timeout: 60000 });
    await utils.sleep(2000);
    if (unique) {
      return await page.$(selector);
    }
    return await page.$$(selector);
  }
  async function typeToInput(selector, text) {
    await waitThenGetElement(selector);
    await page.type(selector, text, { delay: 50 });
  }
  async function evalScript(selector, evalCb) {
    await waitThenGetElement(selector);
    return await page.$eval(selector, evalCb);
  }
}

run();
