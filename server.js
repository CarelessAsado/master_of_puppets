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

  const fakeData = ["Sheeran", "John Mayer"];

  for (const query of fakeData) {
    await later(page, query);
  }

  /*   await later(page); */
  /*   await test(page); */
  await page.screenshot({ path: "bla.jpg" });
})();

const EMAIL = process.env.EMAIL;

const loginGoogle = async (page) => {
  const navigationPromise = page.waitForNavigation();
  const pureUrl = "https://accounts.google.com/";
  let string =
    "https://accounts.google.com/v3/signin/identifier?dsh=S-503134912%3A1672089487478862&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&ec=65620&hl=en&passive=true&service=youtube&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=AeAAQh6_jqjPaB4zQ9pfTixvDvh8DLv-qiPTEbVIQwLx-WbuwrxAYAik-qMvsNlYDFa0w4daiOwr5Q";
  await page.goto(string);

  await navigationPromise;

  await page.waitForSelector('input[type="email"]');
  /*  await page.click('input[type="email"]'); 
   await navigationPromise; */

  //TODO : change to your email
  await page.type('input[type="email"]', EMAIL);

  await page.waitForSelector("#identifierNext");

  await page.click("#identifierNext");

  await page.waitForTimeout(5500);

  await page.waitForSelector('input[type="password"]');
  await page.click('input[type="password"]');
  await navigationPromise;
  await page.screenshot({ path: "bla.jpg" });
  await page.type('input[type="password"]', process.env.PWD);

  await page.waitForSelector("#passwordNext");
  await page.click("#passwordNext");
  await page.waitForTimeout(3500);
  await navigationPromise;
};

const test = async (page) => {
  await page.goto(`https://www.youtube.com/watch?v=2Vv-BfVoq4g`);

  await page.waitForSelector("#button-shape");
  await page.screenshot({ path: "new.jpg" });
  const btnSelector = "yt-button-shape#button-shape";
  //NO ANDA "yt-button-shape#button-shape";
  //NO ANDA"div.yt-spec-touch-feedback-shape__fill";
  //NO ANDA"yt-touch-feedback-shape";
  //anda pero depende del language fr x ej autres actions
  //const btnSelector =    ".yt-spec-button-shape-next--icon-button[aria-label='More actions']";

  await page.evaluate((btnSelector) => {
    // this executes in the page
    const obj = document.querySelector(btnSelector);
    console.log(obj, 666);
    obj.click();
  }, btnSelector);

  await page.evaluate(() => {
    const enregistrerOption = document.querySelector(
      document.querySelector(
        "#items > ytd-menu-service-item-renderer:nth-child(3) > tp-yt-paper-item > yt-formatted-string"
      )
    );
    enregistrerOption.click();
  });

  //con esto checkeo el CBOX y ya puedo hacer page refresh p/seguir
  await page.evaluate(() => {
    const cbox = document.querySelector("#label[aria-label='MÚSICA Privée']");
    cbox.click();
    console.log(cbox, 666);
  });
  //este anda en test pero no cuando hago todo el camino de reloads
  /*  await page.click("#button-shape"); */
  //por otro lado, el page.evaluate no anda cuando uso #button-shape XD, solo me registra el click event cuando uso otro html element
};

const later = async (page, query) => {
  /*  const query = "Sheeran"; */
  //www.youtube.com/watch?v=2Vv-BfVoq4g
  https: await page.goto(
    `https://www.youtube.com/results?search_query=${query}`
  );
  await page.screenshot({ path: "bla.jpg" });
  await page.waitForSelector("#contents");
  /*   await page.screenshot({ path: "bla.jpg" }); */
  //ytd-thumbnail este elije publics, y radio (playlists)
  const resultsSelector = "ytd-video-renderer ytd-thumbnail";
  const wrapper = await page.$$(resultsSelector);
  // Type into search box.
  /*  await page.type(".ytd-searchbox", "sheeran"); */

  // Wait for suggest overlay to appear and click "show all results".
  /*   const allResultsSelector = ".devsite-suggest-all-results";
  await page.waitForSelector(allResultsSelector);
  await page.click("#search-icon-legacy"); */

  // Wait for the results page to load and display the results.
  /*   const resultsSelector = ".gsc-results .gs-title";
  await page.waitForSelector("#button-shape");
    await page.click("#search-icon-legacy"); */

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
  console.log(wrapper.length);
  if (wrapper.length > 2) {
    await page.evaluate((resultsSelector) => {
      return [...document.querySelectorAll(resultsSelector)].map((anchor) => {
        console.log(anchor);
        /*  const title = anchor.textContent.split("|")[0].trim();
        return `${title} - ${anchor.href}`; */
      });
    }, resultsSelector);

    console.log(wrapper[1]);
    await wrapper[0].click();

    const btnSelector =
      "button.yt-spec-button-shape-next--icon-button[aria-label='Autres actions']";

    await page.waitForSelector(btnSelector);
    await page.evaluate((btnSelector) => {
      // this executes in the page
      const cbox = document.getElementById("checkboxContainer");
      console.log(cbox);
      document.querySelector(btnSelector).click();
    }, btnSelector);

    await page.screenshot({ path: "enregistrer.jpg" });

    await page.evaluate(() => {
      const enregistrerOption = document.querySelector(
        "#items > ytd-menu-service-item-renderer:nth-child(3) > tp-yt-paper-item > yt-formatted-string"
      );
      console.log(enregistrerOption.textContent, 999);
      enregistrerOption.click();
    });

    await page.screenshot({ path: "checkbox.jpg" });

    await page.waitForSelector("#label[title='MÚSICA']");
    //con esto checkeo el CBOX y ya puedo hacer page refresh p/seguir
    await page.evaluate(() => {
      const cbox = document.querySelector("#label[title='MÚSICA']");
      cbox.click();
      console.log(cbox, 666);
    });

    //UNA VEZ ABIERTO EL MODAL
    //ytd-playlist-add-to-option-renderer >( tp-yt-paper-checkbox Q TIENE ID= checkbox)
    //como saber cual de todas las opciones del popup??
    /*
    yt-formatted-string Q TIENE id="label" Y Q tiene title="MÚSICA" */
  }

  // Print all the files.
  /*   console.log(links.join("\n")); */

  /*   await browser.close(); */
};
