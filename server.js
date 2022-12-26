/* import puppeteer from "puppeteer"; */
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";

puppeteer.use(StealthPlugin());
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const browser = await puppeteer.launch({
    headless: false,

    //https://stackoverflow.com/questions/74251875/puppeteer-error-an-executablepath-or-channel-must-be-specified-for-puppete
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  await loginGoogle(page);

  await page.screenshot({ path: "bla.jpg" });
})();

const EMAIL = process.env.EMAIL;

const loginGoogle = async (page) => {
  const navigationPromise = page.waitForNavigation();

  await page.goto("https://accounts.google.com/");

  await navigationPromise;

  await page.waitForSelector('input[type="email"]');
  await page.click('input[type="email"]');

  await navigationPromise;

  //TODO : change to your email
  await page.type('input[type="email"]', EMAIL);

  await page.waitForSelector("#identifierNext");
  await page.click("#identifierNext");

  await page.waitForTimeout(500);

  /*   await page.waitForSelector('input[type="password"]');
  await page.click('input[type="email"]');
  await page.waitFor(500);

  //TODO : change to your password
  await page.type('input[type="password"]', "yourpassword"); */
};

const later = async () => {
  const query = "Sheeran";

  await page.goto(`https://www.youtube.com/results?search_query=${query}`);
  await page.screenshot({ path: "bla.jpg" });
  await page.waitForSelector("#contents");
  await page.screenshot({ path: "bla.jpg" });
  const wrapper = await page.$("ytd-search-pyv-renderer");
  // Type into search box.
  /*  await page.type(".ytd-searchbox", "sheeran"); */

  // Wait for suggest overlay to appear and click "show all results".
  /*   const allResultsSelector = ".devsite-suggest-all-results";
  await page.waitForSelector(allResultsSelector);
  await page.click("#search-icon-legacy"); */

  // Wait for the results page to load and display the results.
  /*   const resultsSelector = ".gsc-results .gs-title";
  await page.waitForSelector(resultsSelector); */

  // Extract the results from the page.
  /*   const links = await page.evaluate((resultsSelector) => {
    return [...document.querySelectorAll(resultsSelector)].map((anchor) => {
      const title = anchor.textContent.split("|")[0].trim();
      return `${title} - ${anchor.href}`;
    });
  }, resultsSelector); */
  if (!wrapper) {
    return;
  }
  console.log(wrapper);
  await wrapper.click();
  await page.screenshot({ path: "result.jpg" });
  // Print all the files.
  /*   console.log(links.join("\n")); */

  /*   await browser.close(); */
};
