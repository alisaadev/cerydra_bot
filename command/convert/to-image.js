import { webpToImage, webpToVideo } from "../../system/lib/convert.js"

export default {
    command: ["toimg", "tovid", "tomp4", "tovideo"],
    name: "to-image",
    tags: "convert",

    run: async(m, { conn }) => {
        if (!m.quoted?.isMedia) return m.reply("Reply stiker dengan command ." + m.command)
        if (m.quoted.mime !== "image/webp") return m.reply("Mimetype tidak mendukung : " + m.quoted.mime)
        if (m.quoted.isAnimated) {
            let download = await m.quoted.download()
            let media = await webpToVideo(download)

            m.reply(media)
        } else {
            let download = await m.quoted.download()
            let media = await webpToImage(download)

            m.reply(media)
        }
    }
}