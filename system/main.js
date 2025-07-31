import "../storage/config.js"
import { Client, Serialize } from "./lib/serialize.js"

import pino from "pino"
import chalk from "chalk"
import baileys from "baileys"
import chokidar from "chokidar"
import { globSync } from "glob"
import { Boom } from "@hapi/boom"

const logger = pino({
    level: "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss Z",
            ignore: "pid, hostname"
        }
    }
})

const store = baileys.makeInMemoryStore({ logger })

async function start() {
    const { state, saveCreds } = await baileys.useMultiFileAuthState("./system/session")
    const conn = baileys.default({
        logger: logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: baileys.makeCacheableSignalKeyStore(state.keys, logger)
        },
        browser: baileys.Browsers.ubuntu("chrome"),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = baileys.jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)

            return msg?.message || ""
        },
        defaultQueryTimeoutMs: undefined
    })

    store.bind(conn.ev)

    conn.ev.on("contacts.update", (update) => {
        for (let contact of update) {
            let id = baileys.jidNormalizedUser(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    await Client({ conn, store })
    global.conn = conn

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            let customPairingCode = "CRYDRBOT"
            let code = await conn.requestPairingCode(global.pairingNumber, customPairingCode)

            func.logger.info(`Your Pairing Code: ${code?.match(/.{1,4}/g)?.join("-") || code}`)
        }, 3000)
    }

    conn.ev.on("connection.update", async (update) => {
        const { lastDisconnect, connection, qr } = update

        if (connection) func.logger.info(`Connection Status : ${connection}`)
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode

            if (reason === baileys.DisconnectReason.badSession) {
                func.logger.warn("File Sesi Rusak, Harap Hapus Sesi dan Pindai Lagi")
                process.send("reset")
            } else if (reason === baileys.DisconnectReason.connectionClosed) {
                func.logger.warn("Koneksi ditutup, menyambung kembali....")
                await start()
            } else if (reason === baileys.DisconnectReason.connectionLost) {
                func.logger.warn("Koneksi Hilang dari Server, menyambung kembali...")
                await start()
            } else if (reason === baileys.DisconnectReason.connectionReplaced) {
                func.logger.warn("Koneksi Diganti, Sesi Baru Dibuka, Harap Tutup Sesi Saat Ini Terlebih Dahulu")
                process.exit(1)
            } else if (reason === baileys.DisconnectReason.loggedOut) {
                func.logger.warn("Perangkat Keluar, Silakan Pindai Lagi")
                process.exit(1)
            } else if (reason === baileys.DisconnectReason.restartRequired) {
                func.logger.warn("Diperlukan Mulai Ulang, Mulai Ulang...")
                await start()
            } else if (reason === baileys.DisconnectReason.timedOut) {
                func.logger.warn("Waktu Sambungan Habis, Mulai Ulang...")
                process.send("reset")
            } else if (reason === baileys.DisconnectReason.multideviceMismatch) {
                func.logger.warn("Ketidakcocokan multi perangkat, harap pindai lagi")
                process.exit(0)
            } else {
                func.logger.warn(reason)
                process.send("reset")
            }
        }
        if (connection === "open") {
            func.loading()
            await baileys.delay(5500)
        }
    })

    conn.ev.on("creds.update", saveCreds)
    conn.ev.on("messages.upsert", async (message) => {
        if (!message.messages) return

        const m = await Serialize(conn, message.messages[0])
        await (await import(`./handler.js?v=${Date.now()}`)).handler(conn, m, message)
    })

    conn.ev.on("group-participants.update", async (message) => {
        await (await import(`./handler.js?v=${Date.now()}`)).participantsUpdate(message)
    })

    return conn
}

global.plugins = {}
async function filesInit() {
    const cmdFiles = func.path.join(process.cwd(), "command/**/*.js")
    const commandsFiles = globSync(cmdFiles)

    for (let file of commandsFiles) {
        try {
            const module = await import(file)
            global.plugins[file] = module.default || module
        } catch (e) {
            func.logger.error(e)
            delete global.plugins[file]
        }
    }
}

async function watchFiles() {
    let watcher = chokidar.watch([func.path.join(process.cwd(), "command")], { persistent: true })

    watcher
        .on("add", (path) => {
            return func.reloadPlugin("add", path)
        })
        .on("change", (path) => {
            func.logger.info(`Change file - "${path}"`)
            return func.reloadPlugin("change", path)
        })
        .on("unlink", (path) => {
            func.logger.warn(`Deleted file - "${path}"`)
            return func.reloadPlugin("delete", path)
        })
}

start()
filesInit()
watchFiles()