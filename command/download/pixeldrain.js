export default {
    command: ["pixeldrain"],
    name: "pixeldrain",
    tags: "download",

    run: async(m, { conn }) => {
        if (!m.args[0]) return m.reply("Example : .pixeldrain https://pixeldrain.com/u/oPC4Mc5d")
        if (!/(?:https?:\/\/)?(?:www\.)?pixeldrain\.com/.test(m.args[0])) return m.reply("Link tidak valid")

        const link = m.args[0].replace(/\/u\//, "/api/file/")
        const data = await func.getFile(link)

        conn.sendMedia(m.chat, data.data, m, { asDocument: true, fileName: data.name })
    }
}