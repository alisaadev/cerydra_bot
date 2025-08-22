import { exec } from "child_process"

export default {
    command: ["toimg", "tovid", "tomp4", "tovideo"],
    name: "to-image",
    tags: "convert",

    run: async(m, { conn }) => {
        if (!m.quoted?.isMedia) return m.reply("Reply stiker dengan command ." + m.command)
        if (m.quoted.mime !== "image/webp") return m.reply("Mimetype tidak mendukung : " + m.quoted.mime)

        if (m.quoted.isAnimated) {
            /*let download = await m.quoted.download()
            let media = await webpToVideo(download)*/

            m.reply("Sedang maintenance...")
        } else {
            let webp = await m.quoted.download(func.getRandom("webp"))
            let png = func.path.join(process.cwd(), "storage/tmp", func.getRandom("png"))

            exec(`ffmpeg -i ${webp} ${png}`, async(err) => {
                if (err) return m.reply(func.format(err))

                let buffer = func.fs.readFileSync(png)
                m.reply(buffer)
            })
        }
    }
}