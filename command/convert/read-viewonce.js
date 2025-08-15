export default {
    command: ["rvo", "readviewonce"],
    name: "read-viewonce",
    tags: "convert",

    run: async(m, { conn }) => {
        if (!m.quoted?.isMedia) return m.reply("Reply foto yang sekali lihat dengan command ." + m.command)
        let img = await m.quoted.download()

        conn.sendMessage(m.chat, { image: img, caption: m.quoted?.body ? m.quoted.body : "" }, { quoted: m })
    }
}