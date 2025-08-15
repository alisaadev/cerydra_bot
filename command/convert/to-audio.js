import { videoToAudio } from "../../system/lib/convert.js"

export default {
    command: ["toaudio", "tomp3"],
    name: "to-audio",
    tags: "convert",

    run: async(m, { conn }) => {
        let quoted = m.isQuoted ? m.quoted : m

        if (!quoted.isMedia) return m.reply("Kirim atau reply video dengan command ." + m.command)
        if (quoted.mime !== "video/mp4") return m.reply("Mimetype tidak mendukung : " + quoted.mime)

        let media = await quoted.download()
        let audio = await videoToAudio(media)

        m.reply(audio, { asDocument: true })
    }
}