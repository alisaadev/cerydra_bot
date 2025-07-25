import fs from "fs";
import chalk from "chalk";
import { fileURLToPath } from "url";
import junction from "../system/lib/function.js";

//—————「 Setings your bot 」—————//
global.name = "Cerydra - Bot";
global.wm = "Cerydra my wife";

global.author = "Alisa";
global.packname = "Created Sticker By";
global.link = "https://github.com/alisaadev";

global.owner = ["6287760363490"];
global.pairingNumber = "6283872712735";

global.thumbnail = fs.readFileSync("./storage/crydr.jpg");
global.prefix = ".";
global.multiplier = 69;
global.func = junction;

//—————「 Message settings 」—————//
global.mess = {
  admin: "Perintah ini hanya untuk admin grup",
  botAdmin: "Perintah ini hanya dapat digunakan bila bot adalah admin",
  group: "Perintah ini hanya dapat digunakan dalam chat grup",
  loading: "Silakan tunggu sebentar",
  private: "Perintah ini hanya dapat digunakan dalam chat pribadi",
  owner: "Perintah ini hanya untuk pemilik bot",
};

//—————「 Don"t change it 」—————//
let file = fileURLToPath(import.meta.url);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update config.js"));
  import(`${file}?update=${Date.now()}`);
});
