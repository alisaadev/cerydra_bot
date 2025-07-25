import "../storage/config.js";
import { Client, Serialize } from "./lib/serialize.js";

import pino from "pino";
import chalk from "chalk";
import baileys from "baileys";
import chokidar from "chokidar";
import { Boom } from "@hapi/boom";
import NodeCache from "node-cache";

const store = baileys.makeInMemoryStore({
  logger: pino({ level: "fatal" }).child({ level: "fatal" }),
});
const database = new (await import("./lib/database.js")).default();

async function start() {
  process.on("uncaughtException", (err) => console.error(err));
  process.on("unhandledRejection", (err) => console.error(err));

  const content = await database.read();
  if (content && Object.keys(content).length === 0) {
    global.db = {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      settings: {},
      ...(content || {}),
    };
    await database.write(global.db);
  } else {
    global.db = content;
  }

  const msgRetryCounterCache = new NodeCache();
  const { state, saveCreds } =
    await baileys.useMultiFileAuthState("./system/session");
  const conn = baileys.default({
    logger: pino({ level: "fatal" }).child({ level: "fatal" }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: baileys.makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: "fatal" }).child({ level: "fatal" }),
      ),
    },
    browser: baileys.Browsers.ubuntu("chrome"),
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = baileys.jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);

      return msg?.message || "";
    },
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
  });

  store.bind(conn.ev);

  conn.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = baileys.jidNormalizedUser(contact.id);
      if (store && store.contacts)
        store.contacts[id] = { id, name: contact.notify };
    }
  });

  await Client({ conn, store });
  global.conn = conn;

  if (!conn.authState.creds.registered) {
    setTimeout(async () => {
      let code = await conn.requestPairingCode(global.pairingNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(
        chalk.black(chalk.bgGreen("Your Pairing Code : ")),
        chalk.black(chalk.white(code)),
      );
    }, 3000);
  }

  conn.ev.on("connection.update", async (update) => {
    const { lastDisconnect, connection, qr } = update;

    if (connection) conn.logger.info(`Connection Status : ${connection}`);
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

      if (reason === baileys.DisconnectReason.badSession) {
        console.log("File Sesi Rusak, Harap Hapus Sesi dan Pindai Lagi");
        process.send("reset");
      } else if (reason === baileys.DisconnectReason.connectionClosed) {
        console.log("Koneksi ditutup, menyambung kembali....");
        await start();
      } else if (reason === baileys.DisconnectReason.connectionLost) {
        console.log("Koneksi Hilang dari Server, menyambung kembali...");
        await start();
      } else if (reason === baileys.DisconnectReason.connectionReplaced) {
        console.log(
          "Koneksi Diganti, Sesi Baru Dibuka, Harap Tutup Sesi Saat Ini Terlebih Dahulu",
        );
        process.exit(1);
      } else if (reason === baileys.DisconnectReason.loggedOut) {
        console.log("Perangkat Keluar, Silakan Pindai Lagi");
        process.exit(1);
      } else if (reason === baileys.DisconnectReason.restartRequired) {
        console.log("Diperlukan Mulai Ulang, Mulai Ulang...");
        await start();
      } else if (reason === baileys.DisconnectReason.timedOut) {
        console.log("Waktu Sambungan Habis, Mulai Ulang...");
        process.send("reset");
      } else if (reason === baileys.DisconnectReason.multideviceMismatch) {
        console.log("Ketidakcocokan multi perangkat, harap pindai lagi");
        process.exit(0);
      } else {
        console.log(reason);
        process.send("reset");
      }
    }
    if (connection === "open") {
      func.loading();
      await baileys.delay(5500);
    }
  });

  conn.ev.on("creds.update", saveCreds);
  conn.ev.on("messages.upsert", async (message) => {
    if (!message.messages) return;

    const m = await Serialize(conn, message.messages[0]);
    await (
      await import(`./handler.js?v=${Date.now()}`)
    ).handler(conn, m, message);
  });

  conn.ev.on("group-participants.update", async (message) => {
    await (
      await import(`./handler.js?v=${Date.now()}`)
    ).participantsUpdate(message);
  });

  setTimeout(async () => {
    if (global.db) await database.write(global.db);
  }, 30000);

  return conn;
}

global.plugins = {};
async function filesInit() {
  const cmdFiles = func.path.join(process.cwd(), "command/**/*.js");
  const commandsFiles = (await import("glob")).globSync(cmdFiles);

  for (let file of commandsFiles) {
    try {
      const module = await import(file);
      global.plugins[file] = module.default || module;
    } catch (e) {
      console.error(e);
      delete global.plugins[file];
    }
  }
}

async function watchFiles() {
  let watcher = chokidar.watch([func.path.join(process.cwd(), "command")], {
    persistent: true,
  });

  watcher
    .on("add", (path) => {
      return func.reloadPlugin("add", path);
    })
    .on("change", (path) => {
      console.log(
        chalk.bold.bgRgb(51, 204, 51)("INFO: "),
        chalk.cyan(`Change file - "${path}"`),
      );
      return func.reloadPlugin("change", path);
    })
    .on("unlink", (path) => {
      console.log(
        chalk.bold.bgRgb(255, 153, 0)("WARNING: "),
        chalk.redBright(`Deleted file - "${path}"`),
      );
      return func.reloadPlugin("delete", path);
    });
}

start();
filesInit();
watchFiles();
