import { uploadFile } from "../../system/lib/convert.js"

export default {
    command: ["qc", "sqc", "fakechat"],
    name: "quick-chat",
    tags: "convert",

    run: async(m, { conn }) => {
        let quoted = m.isQuoted ? m.quoted : m
        let [a, b] = m.text.split("|")
        let media, reply

        if (quoted?.isMedia) {
            let upload = await uploadFile(await quoted.download())

            media = { media: { url: upload?.directUrl } }
        }

        if (b && m.quoted.sender) {
            reply = {
                name: await conn.getName(m.quoted.sender),
                text: (b == "q") ? quoted.body.replace(m.prefix + m.command, "") : b,
                chatId: 5,
                id: 5
            }
        }

        const data = {
            type: "quoted",
            format: "png",
            backgroundColor: "#ffffff",
            messages: [{
                avatar: true,
                from: {
                    id: 8,
                    name: b ? m.pushName : await conn.getName(quoted.sender),
                    photo: { url: b ? await conn.profilePictureUrl(m.sender, "image").catch(() => "https://i0.wp.com/telegra.ph/file/134ccbbd0dfc434a910ab.png") : await conn.profilePictureUrl(quoted.sender, "image").catch(() => "https://i0.wp.com/telegra.ph/file/134ccbbd0dfc434a910ab.png") }
                },
                ...media,
                text: m.text ? a : quoted.body.replace(m.prefix + m.command, ""),
                replyMessage: { ...reply }
            }]
        }

        const post = await func.axios.post("https://bot.lyo.su/quote/generate", data, { headers: { "Content-Type": "application/json"} })
        const buffer = Buffer.from(post.data.result.image, "base64")

        m.reply(buffer, { asSticker: true })
    }
}