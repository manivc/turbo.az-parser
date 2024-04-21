import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import chalk from "chalk";

export default async function saveData(data) {
  const { code } = data;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const savePath = path.join(__dirname, `../data/${code}.json`);

  return new Promise((resolve, reject) => {
    fs.writeFile(savePath, JSON.stringify(data, null, 4), (err) => {
      if (err) {
        return reject(err);
      }

      console.log(chalk.blue(`Data saved to ${savePath}`));
      resolve();
    });
  });
}
