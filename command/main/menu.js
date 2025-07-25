import os from "os"
import { sizeFormatter } from "human-readable"

export default {
    command: ["menu"],
    description: "Menampilkan list menu",
    name: "menu",
    tags: "main",

    run: async(m, { conn }) => {
        let menu = {
            before: `
┌ • Hi @%user %ucapan
│ • *Uptime* : %uptime
│ • *Prefix* : ( %prefix )
│ • *Memory Used* : %memory_used / %memory_free
╰───────···

┌ • *Creator* : al npc
│ • *Instagram* : noorlyzz
╰───────···
`.trimStart(),
            header: "┌ • %category",
            body: "│ • %cmd",
            footer: "╰───────···\n",
            after: "Jika Anda menemukan bug/kesalahan, segera laporkan ke pemilik bot"
        }

        let tags = {
            "download": "*Downloader*",
            "main": "*Main*",
            "owner": "*Owner*",
            "sticker": "*Sticker*"
        }

        let formatp = sizeFormatter({
            std: "JEDEC",
            decimalPlaces: 2,
            keepTrailingZeroes: false,
            render: (literal, symbol) => `${literal} ${symbol}B`,
        })

        let help = Object.values(plugins).map(plugin => {
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

        let _text = [menu.before, ...Object.keys(tags).map(tag => {
            return menu.header.replace(/%category/g, tags[tag]) + "\n" + [...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.cmd).map(_menu => {
                return _menu.cmd.map(help => {
                    return menu.body.replace(/%cmd/g, prefix ? help : "." + help).trim()
                }).join("\n")
            }), menu.footer].join("\n")
        }), menu.after].join("\n")

        let text = _text.replace(/%user/, m.sender.split('@')[0]).replace(/%ucapan/, func.timeSpeech()).replace(/%uptime/, func.runtime(process.uptime())).replace(/%prefix/, prefix).replace(/%memory_used/, formatp(os.totalmem() - os.freemem())).replace(/%memory_free/, formatp(os.totalmem()))
        conn.sendMessage(m.chat, { image: thumbnail, caption: text, mentions: [m.sender] }, { quoted: m })
    }
}