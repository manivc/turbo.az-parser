import cheerio from "cheerio";
import chalk from "chalk";

import saveData from "./saver.js";
import { p, taskQueue } from "../index.js";

const task = async (initialData) => {
  try {
    console.log(
      chalk.green(
        `${chalk.black.bgYellow(
          "Getting data from"
        )} ${chalk.green.bold.bgCyan(initialData.url)}`
      )
    );
    const detailContent = await p.getPageContent(initialData.url);
    const $ = cheerio.load(detailContent);

    const year = $('div.product-properties__i label[for="ad_reg_year"]')
      .closest(".product-properties__i")
      .find("span.product-properties__i-value a")
      .text();

    await saveData({
      ...initialData,
      year,
    });
  } catch (error) {
    throw error
  }
}

export default function listItemsHandler(data) {
  data.forEach((initialData) => {
    taskQueue.push(
      () => task(initialData),
      err => {
        if (err) {
          console.log(err);
          throw new Error(`⛔️ Error getting data from url [${initialData.url}]`);
        }
        console.log(
          chalk.green(`✅ Success getting data from url [${initialData.url}]`)
        );
      }
    );
  });
}
