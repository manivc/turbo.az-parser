import cheerio from "cheerio";
import chalk from "chalk";
import { slugify } from "transliteration";
import { queue } from "async";

import { arrayFromLength } from "./helpers/common.js";
import { PuppeteerHandler } from "./helpers/puppeteer.js";
import listItemsHandler from "./handlers/listItemsHandler.js";

const SITE = "https://turbo.az/autos?page=";
const pages = 10;
const concurrency = 10;
const startTime = new Date();

export const p = new PuppeteerHandler();
export const taskQueue = queue(async (task) => {
  try {
    await task();
    console.log(`Task completed, tasks left: ${taskQueue.length()}\n`);
  } catch (error) {
    throw error;
  }
}, concurrency);

taskQueue.drain(function () {
  const endTime = new Date();
  console.log(
    chalk.green(`All tasks completed in ${(endTime - startTime) / 1000}s`)
  );
  p.closeBrowser();
  process.exit();
});

(function main() {
  arrayFromLength(pages).forEach((page) => {
    taskQueue.push(
      () => listPageHandle(`${SITE}${page}`),
      (err) => {
        if (err) {
          console.log(err);
          throw new Error(`⛔️ Error getting data from page #${page}`);
        }
        console.log(
          chalk.green(`✅ Completed getting data from page #${page}`)
        );
      }
    );
  });
})();

async function listPageHandle(url) {
  try {
    const pageContent = await p.getPageContent(url);
    const $ = cheerio.load(pageContent);
    const carsItems = [];
    $(".products-i").each((_, el) => {
      const url = $(el).find(".products-i__link").attr("href");
      const title = $(el).find(".products-i__name").text();
      const price = $(el).find(".product-price").text();
      carsItems.push({
        title,
        price,
        url: `https://turbo.az${url}`,
        code: slugify(title),
      });
    });
    listItemsHandler(carsItems);
  } catch (error) {
    console.log(chalk.red("An error occurred: ", err));
    console.log(err);
  }
}
