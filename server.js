/* import puppeteer from "puppeteer"; PODRIA HABER HECHO ESTO, pero finalmente google no le gusta el chrome automatizado, asi q tuve q descargar puppettear-extra y stealth*/
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
puppeteer.use(StealthPlugin());
import dotenv from "dotenv";
dotenv.config();

import { mainDeezer, readJson } from "./deezer.js";

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PWD;

(async () => {
  await mainDeezer();

  const songsData = readJson();

  const browser = await puppeteer.launch({
    headless: false,

    //https://stackoverflow.com/questions/74251875/puppeteer-error-an-executablepath-or-channel-must-be-specified-for-puppete
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  if (songsData.length > 0) {
    console.log(
      "ok, hay canciones en el JSON FILE, asi q arrancamos el chrome bot"
    );
  } else {
    console.log("NO DATA TO UPLOAD TO YOUTUBE");
    return;
  }
  await loginGoogle(page);

  for (const query of songsData) {
    await later(page, query);
  }
  //TESTING, lo usé p/evitar el login a veces
  /*   await test(page); */

  //si queres cerrar el proceso al final, prefiero dejar el browser abierto en caso de error
  /*  await browser.close();  */
})();

const loginGoogle = async (page) => {
  const navigationPromise = page.waitForNavigation();

  let string =
    "https://accounts.google.com/v3/signin/identifier?dsh=S-503134912%3A1672089487478862&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&ec=65620&hl=en&passive=true&service=youtube&uilel=3&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=AeAAQh6_jqjPaB4zQ9pfTixvDvh8DLv-qiPTEbVIQwLx-WbuwrxAYAik-qMvsNlYDFa0w4daiOwr5Q";
  await page.goto(string);

  await navigationPromise;

  await page.waitForSelector('input[type="email"]');
  /*  await page.click('input[type="email"]'); 
   await navigationPromise; */

  await page.type('input[type="email"]', EMAIL);

  await page.waitForSelector("#identifierNext");

  await page.click("#identifierNext");

  await page.waitForTimeout(5500);

  await page.waitForSelector('input[type="password"]');
  await page.click('input[type="password"]');
  await navigationPromise;
  await page.screenshot({ path: "bla.jpg" });
  await page.type('input[type="password"]', PASSWORD);

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
  await page.goto(`https://www.youtube.com/results?search_query=${query}`);

  await page.waitForSelector("#contents");

  console.log("NOW: " + query);
  //ytd-thumbnail, con ese html element evito agarra publicidades y playlists(q llevan el HTML element radio renderer)
  const resultsSelector = "ytd-video-renderer ytd-thumbnail";
  const wrapper = await page.$$(resultsSelector);

  if (!wrapper) {
    return;
  }

  if (wrapper.length > 0) {
    //clickeamos el 1er resultado de la busqueda
    await wrapper[0].click();

    const btnSelector =
      "button.yt-spec-button-shape-next--icon-button[aria-label='Autres actions']";

    await page.waitForSelector(btnSelector);
    await page.evaluate((btnSelector) => {
      document.querySelector(btnSelector).click();
    }, btnSelector);

    await page.evaluate(() => {
      let stopLoop = false;
      let num = 0;
      //loopeo todas las opcion y busco la q sea GUARDAR (esta es la mejor manera q encontré p/hacerlo dinamicamente, xq el orden de las options cambia a veces)
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

    /*  PLAYLIST MUSICA / CBOX */
    await page.waitForSelector("#label[title='MÚSICA']");

    //todo lo q hagas referencia en evaluate es como si estuvieras adentro del browser, si necesitas una variable, la podés pasar como 2do arg al method "evaluate"
    await page.evaluate(() => {
      //agarro el label q pertenecer a la playlist MUSICA
      const cbox = document.querySelector("#label[title='MÚSICA']");

      //chequeo q esa cancion no esté ya incluida en la playlist
      if (
        cbox?.parentNode?.parentNode?.parentNode?.parentNode?.checked === false
      ) {
        cbox.click();
      }
    });
  }
};
