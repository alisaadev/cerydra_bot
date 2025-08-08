import os from "os"

export default {
    command: ["menu"],
    name: "menu",
    tags: "main",

    run: async(m, { conn }) => {
        let menu = {
            before: `
╭──┄  *DASHBOARD*  ┄──
│• *Bot name*: ${name}
│• *Baileys*: nstar-y/bail
│• *Prefix*: [ %prefix ]
│• *Uptime*: %uptime
│• *Platform*: %platform
│• *Memory used*: %memory_used / %memory_free
│
│• *Date*: %date
│• *Islamic*: %islamic
│
│• *Creator*: ${author}
│• *Github*: alisaadev
╰─────── ୨୧ ───────┘
%readmore`.trimStart(),
            header: "┌ • %category",
            body: "│ • %cmd",
            footer: "╰───────···\n"
        }

        let tags = {
            main: "*Main*",
            sticker: "*Sticker*"
        }

        let more = String.fromCharCode(8206)
        let readMore = more.repeat(4001)
        let help = Object.values(plugins).map((plugin) => {
            return {
                cmd: plugin.command,
                description: plugin.description,
                name: plugin.name,
                tags: [plugin.tags]
            }
        })

        for (let plugin of help) {
            if (plugin && "tags" in plugin) {
                for (let tag of plugin.tags) {
                    if (!(tag in tags) && tag) tags[tag] = tag
                }
            }
        }

        let _text = [menu.before, ...Object.keys(tags).map((tag) => { return (menu.header.replace(/%category/g, tags[tag]) + "\n" + [...help.filter((menu) => menu.tags && menu.tags.includes(tag) && menu.cmd).map((_menu) => { return _menu.cmd.map((help) => { return menu.body.replace(/%cmd/g, prefix ? help : "." + help).trim() }).join("\n") }), menu.footer].join("\n")) })].join("\n")
        let text = _text.replace(/%prefix/, prefix).replace(/%uptime/, func.runtime(process.uptime())).replace(/%platform/, os.platform()).replace(/%memory_used/, func.formatSize(os.totalmem() - os.freemem())).replace(/%memory_free/, func.formatSize(os.totalmem())).replace(/%date/, func.tanggal(Date.now())).replace(/%islamic/, dateIslamic()).replace(/%readmore/, readMore)

        const interactiveMessage = {
            image: thumbnail,
            caption: text,
            footer: "Jika anda menemukan bug/error, segera laporkan ke pemilik bot",
            interactiveButtons: [{
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Quick Reply",
                    id: ".s"
                })
            }]
        }

        await conn.sendMessage(m.chat, interactiveMessage, { quoted: m })
    }
}

function dateIslamic() {
    const date = new Date()
    const dateIslamic = Intl.DateTimeFormat('id-u-ca-islamic', {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date)

    return dateIslamic
}