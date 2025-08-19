import { promisify } from "util"
import { fileURLToPath } from "url"
import { createRequire } from "module"
import cp, { exec as _exec } from "child_process"
    
export async function handler(conn, m, chatUpdate) {
    if (!m) return

    try {
        if (m.fromMe) return
        if (m.isBaileys) return
        if (!m.isOwner && !settings.public) return
        if (settings.autoread) conn.readMessages([m.key])

        if (m.isOwner) {
            if (m.body.startsWith("eval")) {
                let __dirname = func.path.dirname(fileURLToPath(import.meta.url))
                let require = createRequire(__dirname), _return = ""

                try {
                    _return = /await/i.test(m.text) ? eval("(async() => { " + m.text + " })()") : eval(m.text)
                } catch (e) {
                    _return = e
                }

                new Promise((resolve, reject) => {
                    try {
                        resolve(_return)
                    } catch (err) {
                        reject(err)
                    }
                })?.then((res) => m.reply(func.format(res)))?.catch((err) => m.reply(func.format(err)))
            }

            if (m.body.startsWith("exec")) {
                let exec = promisify(_exec).bind(cp)
                try {
                    exec(m.text, async (err, stdout) => {
                        if (err) return m.reply(func.format(err))
                        if (stdout) return m.reply(func.format(stdout))
                    })
                } catch (e) {
                    m.reply(func.format(e))
                }
            }
        }

        for (let name in global.plugins) {
            let plugin = global.plugins[name]

            if (!plugin) continue
            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(conn, m, { chatUpdate })
                } catch (e) {
                    func.logger.error(e)
                    conn.sendMessage(owner[0] + "@s.whatsapp.net", { text: "Cmd: " + m.text + "\n" + func.format(e) })
                }
            }

            if (typeof plugin.before === "function") {
                if (await plugin.before.call(conn, m, { chatUpdate })) continue
            }

            if (m.body?.startsWith(m.prefix)) {
                let { args, command, text } = m
                let isAccept = Array.isArray(plugin.command) ? plugin.command.some((cmd) => cmd === command) : false

                m.plugin = name
                if (!isAccept) continue
                if (plugin.owner && !m.isOwner) {
                    m.reply(mess.owner)
                    continue
                }

                if (plugin.group && !m.isGroup) {
                    m.reply(mess.group)
                    continue
                }

                if (plugin.botAdmin && !m.isBotAdmin) {
                    m.reply(mess.botAdmin)
                    continue
                }

                if (plugin.admin && !m.isAdmin) {
                    m.reply(mess.admin)
                    continue
                }

                if (plugin.private && m.isGroup) {
                    m.reply(mess.private)
                    continue
                }

                m.isCommand = true
                let extra = {
                    conn,
                    args,
                    command,
                    text,
                    chatUpdate
                }

                try {
                    await plugin.run(m, extra)
                } catch (e) {
                    func.logger.error(e)
                    conn.sendMessage(owner[0] + "@s.whatsapp.net", { text: "Cmd: " + m.text + "\n" + func.format(e) })
                } finally {
                    if (typeof plugin.after === "function") {
                        try {
                            await plugin.after.call(conn, m, extra)
                        } catch (e) {
                            func.logger.error(e)
                            conn.sendMessage(owner[0] + "@s.whatsapp.net", { text: "Cmd: " + m.text + "\n" + func.format(e) })
                        }
                    }
                }
            }
        }
    } catch (e) {
        func.logger.error(e)
    }
}

export async function participantsUpdate({ id, participants, action }) {
    if (!settings.public) return

    let ppuser
    let metadata = await conn.groupMetadata(id)

    switch (action) {
        case "add":
        case "remove":
            for (let user of participants) {
                let tekswell = `Halo @${user.split("@")[0]} 👋\n\nSelamat datang di grup ${metadata.subject}! Kami senang kamu bergabung dengan kami.`
                let teksbye = `Selamat tinggal @${user.split("@")[0]} 👋\n\nSalam perpisahan, kami harap kamu baik-baik saja disana`

                if (action == "add") conn.sendMessage(id, { text: tekswell, mentions: [user] })
                if (action == "remove") conn.sendMessage(id, { text: teksbye, mentions: [user] })
            }
            break
        case "promote":
        case "demote":
            let tekspro = `Selamat @${participants[0].split("@")[0]} atas kenaikan pangkatnya di grup ${metadata.subject} 🥂`
            let teksdem = `Sabar yaa @${participants[0].split("@")[0]} atas penurunan pangkatnya di grup ${metadata.subject} 😔`

            if (action == "promote") conn.sendMessage(id, { text: tekspro, mentions: [participants[0]] })
            if (action == "demote") conn.sendMessage(id, { text: teksdem, mentions: [participants[0]] })
            break
    }
}