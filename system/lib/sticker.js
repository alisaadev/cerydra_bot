import fs from "fs"
import path from "path"
import ff from "fluent-ffmpeg"
import webp from "node-webpmux"

async function imageToWebp(media) {
    const tmpFileOut = path.join(process.cwd(), "storage/tmp", await func.getRandom("webp"))
    const tmpFileIn = path.join(process.cwd(), "storage/tmp", await func.getRandom("jpg"))

    fs.writeFileSync(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    return buff
}

async function videoToWebp(media) {
    const tmpFileOut = path.join(process.cwd(), "storage/tmp", await func.getRandom("webp"))
    const tmpFileIn = path.join(process.cwd(), "storage/tmp", await func.getRandom("mp4"))

    fs.writeFileSync(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00.0",
                "-t",
                "00:00:05.0",
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    })

    const buff = fs.readFileSync(tmpFileOut)
    return buff
}

async function writeExif(media) {
    const _media = /webp/.test(media.mimetype) ? media.data : /image/.test(media.mimetype) ? await imageToWebp(media.data) : /video/.test(media.mimetype) ? await videoToWebp(media.data) : ""
    const tmpFileOut = path.join(process.cwd(), "storage/tmp", await func.getRandom("webp"))
    const tmpFileIn = path.join(process.cwd(), "storage/tmp", await func.getRandom("webp", "15"))

    fs.writeFileSync(tmpFileIn, _media)

    const img = new webp.Image()
    const json = {
        "sticker-pack-id": link,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        "emojis": [],
        "is-avatar-sticker": 0
    }

    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
    const exif = Buffer.concat([exifAttr, jsonBuff])

    exif.writeUIntLE(jsonBuff.length, 14, 4)
    await img.load(tmpFileIn)
    img.exif = exif
    await img.save(tmpFileOut)

    return tmpFileOut
}

export { imageToWebp, videoToWebp, writeExif }