/* import puppeteer from "puppeteer"; */
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";

puppeteer.use(StealthPlugin());
import dotenv from "dotenv";
import { readJson } from "./deezer.js";
dotenv.config();

const songsData = readJson();

(async () => {
  const browser = await puppeteer.launch({
    headless: false,

    //https://stackoverflow.com/questions/74251875/puppeteer-error-an-executablepath-or-channel-must-be-specified-for-puppete
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  if (songsData.length > 0) {
    console.log("ok");
  } else {
    return;
  }
  await loginGoogle(page);

  for (const query of songsData) {
    await later(page, query);
  }

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

  //NO ANDA "yt-button-shape#button-shape";
  //NO ANDA"div.yt-spec-touch-feedback-shape__fill";
  //NO ANDA"yt-touch-feedback-shape";
  //anda pero depende del language fr x ej autres actions
  //const btnSelector =    ".yt-spec-button-shape-next--icon-button[aria-label='More actions']";
  // ANDABA PERO DEJO DE ANDAR el btnSelector y la evaluate fn
  /*  const btnSelector = "yt-button-shape#button-shape"; */
  /*  await page.evaluate((btnSelector) => {
    // this executes in the page
    const obj = document.querySelector(btnSelector);
    console.log(obj, 666);
    obj.click();
  }, btnSelector); */
  const btnSelector =
    "button.yt-spec-button-shape-next--icon-button[aria-label='Autres actions']";

  await page.waitForSelector(btnSelector);
  await page.evaluate((btnSelector) => {
    // this executes in the page
    document.querySelector(btnSelector).click();
  }, btnSelector);

  await page.evaluate(() => {
    let stopLoop = false;
    let num = 0;

    while (!stopLoop) {
      const enregistrerOption = document.querySelector(
        `#items > ytd-menu-service-item-renderer:nth-child(${num}) > tp-yt-paper-item > yt-formatted-string`
      );

      if (enregistrerOption?.textContent === "Enregistrer") {
        enregistrerOption.click();
        stopLoop = true;
      } else {
        num = num + 1;
      }
    }
  });

  //con esto checkeo el CBOX y ya puedo hacer page refresh p/seguir
  /*  await page.evaluate(() => {
    const cbox = document.querySelector("#label[aria-label='MÚSICA Privée']");
    cbox.click();
    console.log(cbox, 666);
  }); */
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

  await page.waitForSelector("#contents");

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
      document.querySelector(btnSelector).click();
    }, btnSelector);

    //REEMPLAZAR ACA

    await page.evaluate(() => {
      let stopLoop = false;
      let num = 0;

      while (!stopLoop) {
        const enregistrerOption = document.querySelector(
          `#items > ytd-menu-service-item-renderer:nth-child(${num}) > tp-yt-paper-item > yt-formatted-string`
        );

        if (enregistrerOption?.textContent === "Enregistrer") {
          enregistrerOption.click();
          stopLoop = true;
        } else {
          num = num + 1;
        }
      }
    });

    /*    await page.screenshot({ path: "checkbox.jpg" }); */

    await page.waitForSelector("#label[title='MÚSICA']");
    //con esto checkeo el CBOX y ya puedo hacer page refresh p/seguir
    await page.evaluate(() => {
      //const cbox = document.querySelector("#checkbox[checked]")
      const cbox = document.querySelector("#label[title='MÚSICA']");
      if (
        cbox?.parentNode?.parentNode?.parentNode?.parentNode?.checked === false
      ) {
        cbox.click();
        console.log(cbox, 666);
      }
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
