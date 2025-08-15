export default {
    command: ["sticker", "stiker", "s"],
    name: "sticker",
    tags: "convert",

    run: async(m, { conn }) => {
        let quoted = m.isQuoted ? m.quoted : m

        if (m.args[0] && func.isUrl(m.args[0])) return m.reply(quoted.args[0], { asSticker: true })
        if (!quoted.isMedia) return m.reply("Kirim atau reply foto dengan command ." + m.command)

        let media = await quoted.download()

        m.reply(media, { asSticker: true })
    }
}
