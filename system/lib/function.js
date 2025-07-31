import fs from "fs"
import path from "path"
import axios from "axios"
import chalk from "chalk"
import { format } from "util"
import term from "terminal-kit"
import mimes from "mime-types"
import * as cheerio from "cheerio"
import { exec } from "child_process"
import moment from "moment-timezone"
import { fileTypeFromBuffer } from "file-type"

export default new(class Function {
    constructor() {
        this.axios = axios
        this.cheerio = cheerio
        this.fs = fs
        this.path = path
        this.logger = this.logging()
    }

    sleep(ms) {
        return new Promise((a) => setTimeout(a, ms))
    }

    format(str) {
        return format(str)
    }

    jam(numer, options = {}) {
        let format = options.format ? options.format : "HH:mm"
        let jam = options?.timeZone ? moment(numer).tz(options.timeZone).format(format) : moment(numer).format(format)

        return `${jam}`
    }

    tanggal(numer, timeZone = "") {
        const myMonths = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember" ]
        const myDays = [ "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu" ]

        let tgl = new Date(numer)
        timeZone ? tgl.toLocaleString("en", { timeZone }) : ""
        let day = tgl.getDate()
        let bulan = tgl.getMonth()
        var thisDay = tgl.getDay(),
            thisDay = myDays[thisDay]
        let yy = tgl.getYear()
        let year = yy < 1000 ? yy + 1900 : yy

        return `${thisDay}, ${day} ${myMonths[bulan]} ${year}`
    }

    async fetchJson(url, options = {}) {
        try {
            let data = await axios.get(url, { headers: { ...(!!options.headers ? options.headers : {}) }, responseType: "json", ...options })

            return await data?.data
        } catch (e) {
            throw e
        }
    }

    async getFile(PATH) {
        try {
            let filename = null
            let data = (await this.fetchBuffer(PATH))

            if (data?.data) {
                filename = path.join(process.cwd(), "storage/tmp", Date.now() + "." + data.ext)
                fs.promises.writeFile(filename, data?.data)
            }

            return {
                filename: data?.name ? data.name : filename,
                ...data
            }
        } catch (e) {
            throw e
        }
    }

    fetchBuffer(string, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                if (/^https?:\/\//i.test(string)) {
                    let data = await axios.get(string, {
                        headers: {
                        ...(!!options.headers ? options.headers : {}),
                    },
                        responseType: "arraybuffer",
                        ...options
                    })

                    let buffer = await data?.data
                    let name = /filename/i.test(data.headers?.get("content-disposition")) ? data.headers?.get("content-disposition")?.match(/filename=(.*)/)?.[1]?.replace(/[""]/g, "") : ""
                    let mime = mimes.lookup(name) || data.headers.get("content-type") || (await fileTypeFromBuffer(buffer))?.mime

                    resolve({ data: buffer, size: Buffer.byteLength(buffer), sizeH: this.formatSize(Buffer.byteLength(buffer)), name, mime, ext: mimes.extension(mime) })
                } else if (/^data:.*?\/.*?base64,/i.test(string)) {
                    let data = Buffer.from(string.split(",")[1], "base64")
                    let size = Buffer.byteLength(data)

                    resolve({ data, size, sizeH: this.formatSize(size), ...((await fileTypeFromBuffer(data)) || { mime: "application/octet-stream", ext: ".bin" }) })
                } else if (fs.existsSync(string) && fs.statSync(string).isFile()) {
                    let data = fs.readFileSync(string)
                    let size = Buffer.byteLength(data)

                    resolve({ data, size, sizeH: this.formatSize(size), ...((await fileTypeFromBuffer(data)) || { mime: "application/octet-stream", ext: ".bin" }) })
                } else if (Buffer.isBuffer(string)) {
                    let size = Buffer?.byteLength(string) || 0

                    resolve({ data: string, size, sizeH: this.formatSize(size), ...((await fileTypeFromBuffer(string)) || { mime: "application/octet-stream", ext: ".bin" }) })
                } else if (/^[a-zA-Z0-9+/]={0,2}$/i.test(string)) {
                    let data = Buffer.from(string, "base64")
                    let size = Buffer.byteLength(data)

                    resolve({ data, size, sizeH: this.formatSize(size), ...((await fileTypeFromBuffer(data)) || { mime: "application/octet-stream", ext: ".bin" }) })
                } else {
                    let buffer = Buffer.alloc(20)
                    let size = Buffer.byteLength(buffer)

                    resolve({ data: buffer, size, sizeH: this.formatSize(size), ...((await fileTypeFromBuffer(buffer)) || { mime: "application/octet-stream", ext: ".bin" }) })
                }
            } catch (e) {
                reject(new Error(e?.message || e))
            }
        })
    }

    mime(name) {
        let mimetype = mimes.lookup(name)
        if (!mimetype) return mimes.extension(name)
        return {
            mime: mimetype,
            ext: mimes.extension(mimetype)
        }
    }

    isUrl(url) {
        let regex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "gi")
        if (!regex.test(url)) return false
        return url.match(regex)
    }

    escapeRegExp(string) {
        return string.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, "\\$&")
    }

    toUpper(query) {
        const arr = query.split(" ")
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
        }

        return arr.join(" ")
    }

    getRandom(ext = "", length = "10") {
        let result = ""
        let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
        let characterLength = character.length

        for (let i = 0; i < length; i++) {
            result += character.charAt(Math.floor(Math.random() * characterLength))
        }

        return `${result}${ext ? `.${ext}` : ""}`
    }

    formatSize(bytes, si = true, dp = 2) {
        const thresh = si ? 1000 : 1024

        if (Math.abs(bytes) < thresh) {
            return `${bytes} B`
        }

        const units = si ? ["kB", "MB", "GB", "TB"] : ["KiB", "MiB", "GiB", "TiB"]
        const r = 10 ** dp
        let u = -1

        do {
            bytes /= thresh
            ++u
        } while (
            Math.round(Math.abs(bytes) * r) / r >= thresh &&
            u < units.length - 1
        )

        return `${bytes.toFixed(dp)} ${units[u]}`
    }

    runtime(seconds) {
        seconds = Number(seconds)
        let d = Math.floor(seconds / (3600 * 24))
        let h = Math.floor((seconds % (3600 * 24)) / 3600)
        let m = Math.floor((seconds % 3600) / 60)
        let s = Math.floor(seconds % 60)
        let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
        let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
        let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
        let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
        return dDisplay + hDisplay + mDisplay + sDisplay
    }

    loading() {
        let { terminal } = term
        let progressBar, progress = 0

        function doProgress() {
            progress += Math.random() / 10
            progressBar.update(progress)
            if (progress >= 1) {
                setTimeout(function() {
                    (console.clear(), exec("screenfetch - A Deepin", (error, stdout, stderr) => {
                        (console.log(stdout), console.log(chalk.bgGray("Cerydra bot created by @alisaadev")))
                    }))
                }, 200)
            } else {
                setTimeout(doProgress, 90 + Math.random() * 200)
            }
        }

        progressBar = terminal.progressBar({
            width: 80,
            title: "\n\nLoad this script....",
            eta: true,
            percent: true
        })

        doProgress()
    }

    reloadPlugin(type, file) {
        const filename = (file) => file.replace(/^.*[\\\/]/, "")

        switch (type) {
            case "delete":
                return delete global.plugins[file]
                break
            case "add":
            case "change":
                try {
                    (async () => {
                        const module = await import(`${file}?update=${Date.now()}`)
                        global.plugins[file] = module.default || module
                    })()
                } catch (e) {
                    console.error(`Error require plugin "${filename(file)}\n${format(e)}"`)
                } finally {
                    global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
                }
                break
        }
    }

    logging() {
        return {
            info(...args) {
                console.log(
                    chalk.bold.bgRgb(51, 204, 51)("INFO "),
                    `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                    chalk.cyan(format(...args))
                )
            },
            error(...args) {
                console.log(
                    chalk.bold.bgRgb(247, 38, 33)("ERROR "),
                    `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                    chalk.rgb(255, 38, 0)(format(...args))
                )
            },
            warn(...args) {
                console.log(
                    chalk.bold.bgRgb(255, 153, 0)("WARNING "),
                    `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                    chalk.redBright(format(...args))
                )
            },
            trace(...args) {
                console.log(
                    chalk.grey("TRACE "),
                    `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                    chalk.white(format(...args))
                )
            },
            debug(...args) {
                console.log(
                    chalk.bold.bgRgb(66, 167, 245)("DEBUG "),
                    `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`,
                    chalk.white(format(...args))
                )
            }
        }
    }
})()