import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

const cache = func.path.join(process.cwd(), "/storage/cache_anime.json")
const data = { animeData: null, lastScrapeTime: 0 }
const adapter = new JSONFile(cache)
const db = new Low(adapter, data)
const cache_duration_ms = 60 * 60 * 1000

await db.read()
await db.write()

async function scrapeAnimeHome() {
    const data = await func.axios.get(same, { "User Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36" })
    const $ = func.cheerio.load(data.data)
    const latestAnimeResults = []
    const topAnimeResults = []
    const info = $("div.wp-block-group > p").eq(1).find("strong").text().trim()

    $('li[itemscope="itemscope"] > div.dtla').each((i, el) => {
        const judulAnime = $(el).find("h2.entry-title a").text().trim()
        const href = $(el).find("h2.entry-title a").attr("href")?.trim()
        const episode = $(el).find("span > author").eq(0).text().trim()
        const rilis = $(el).find("span").eq(2).text().trim()

        latestAnimeResults.push({
            judulAnime: judulAnime,
            linkAnime: href,
            episode: episode,
            rilis: rilis
        })
    })

    $("div.topten-animesu > ul > li").each((i, el) => {
        const linkElement = $(el).find("a.series")
        const judulElement = $(el).find("span.judul")
        const ratingElement = $(el).find("span.rating")
        const topElement = $(el).find("b.is-topten > b")

        const href = linkElement.attr("href")?.trim()
        const judulAnime = judulElement.text().trim()
        const rating = ratingElement.text().trim()
        const topText = topElement.eq(0).text().trim()
        const topNumber = topElement.eq(1).text().trim()

        topAnimeResults.push({
            judulAnime: judulAnime,
            linkAnime: href,
            rating: rating,
            peringkatTop: topText + " " + topNumber
        })
    })

    return {
        information: info,
        latestAnime: latestAnimeResults,
        topAnime: topAnimeResults
    }
}

async function scrapeAnimeSearch(query) {
    const url = same + "?s=" + encodeURIComponent(query)
    const data = await func.axios.get(url, { "User Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36" })
    const $ = func.cheerio.load(data.data)
    const searchAnimeResults = []

    $("div.animposx > a").each((i, el) => {
        const href = $(el).attr("href").trim()
        const judulAnime = $(el).find("div.data > div.title").text().trim()
        const typeAnime = $(el).find("div.content-thumb > div.type").text().trim()
        const rating = $(el).find("div.content-thumb > div.score").text().trim()
        const status = $(el).find("div.data > div.type").text().trim()

        searchAnimeResults.push({
            judulAnime: judulAnime,
            linkAnime: href,
            typeAnime: typeAnime,
            rating: rating,
            status: status
        })
    })

    return searchAnimeResults
}

async function scrapeAnimeInfo(url) {
    const data = await func.axios.get(url, { "User Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36" })
    const $ = func.cheerio.load(data.data)
    const infoAnime = {}
    const episodes = []
    const genres = []

    infoAnime.thumbnail = $("div.thumb > img").attr("src")
    infoAnime.latin = $("div.infox > h3").text().replace(/detail anime/ig, "").trim()

    $("div.spe > span").each((i, el) => {
        const label = $(el).find("b").text().trim()
        const value = $(el).text().replace(label, "").trim()
        const key = label.toLowerCase().replace(/:/g, "").replace(/ /g, "_")

        infoAnime[key] = value
    })

    $("div.genre-info > a").each((i, el) => {
        const genre = $(el).text().trim()
        genres.push(genre)
    })

    $("li > div.epsleft").each((i, el) => {
        const href = $(el).find("span.lchx > a").attr("href").trim()
        const text = $(el).find("span.lchx > a").text().trim()
        const date = $(el).find("span.date").text().trim()

        episodes.push({
            link: href,
            name: text,
            date: date
        })
    })

    infoAnime.genre = genres.join(", ")
    infoAnime.rating = $("div.clearfix").text().trim()
    infoAnime.episode = episodes
    infoAnime.batch = $("div.listbatch > a").attr("href")

    return infoAnime
}

async function scrapeAnimeDownload(url) {
    const data = await func.axios.get(url, { "User Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36" })
    const $ = func.cheerio.load(data.data)
    const parent = $("div.download-eps")
    const resomkv = {
        low: [],
        medium: [],
        high: [],
        ultra: []
    }
    const resomp4 = {
        low: [],
        medium: [],
        high: [],
        ultra: []
    }
    const resox265 = {
        medium: [],
        high: [],
        ultra: []
    }

    const mkv = parent.eq(0).each((i, el) => {
        $(el).find("li").eq(0).find("span > a").each((ii, ell) => {
            resomkv.low.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(1).find("span > a").each((ii, ell) => {
            resomkv.medium.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(2).find("span > a").each((ii, ell) => {
            resomkv.high.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(3).find("span > a").each((ii, ell) => {
            resomkv.ultra.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })
    })

    const mp4 = parent.eq(1).each((i, el) => {
        $(el).find("li").eq(0).find("span > a").each((ii, ell) => {
            resomp4.low.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(1).find("span > a").each((ii, ell) => {
            resomp4.medium.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(2).find("span > a").each((ii, ell) => {
            resomp4.high.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(3).find("span > a").each((ii, ell) => {
            resomp4.ultra.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })
    })

    const x265 = parent.eq(2).each((i, el) => {
        $(el).find("li").eq(0).find("span > a").each((ii, ell) => {
            resox265.medium.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(1).find("span > a").each((ii, ell) => {
            resox265.high.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })

        $(el).find("li").eq(2).find("span > a").each((ii, ell) => {
            resox265.ultra.push({
                link: $(ell).attr("href"),
                method: $(ell).text().trim()
            })
        })
    })

    return {
        mkv: resomkv,
        mp4: resomp4,
        x265: resox265
    }
}

async function scrapeAnimeData(url) {
    const currentTime = Date.now()
    const cachedData = db.data.animeData 
    const lastTime = db.data.lastScrapeTime 

    if (cachedData && (currentTime - lastTime < cache_duration_ms)) {
        func.logger.info("Menggunakan data anime dari cache LowDB (ESM).")

        return cachedData 
    } else {
        func.logger.info("Cache LowDB kadaluarsa atau kosong. Melakukan scraping baru (ESM)...")

        try {
            const scrapedData = await scrapeAnimeHome()

            db.data.animeData = scrapedData
            db.data.lastScrapeTime = currentTime
            await db.write()

            func.logger.info("Scraping selesai. Cache LowDB diperbarui (ESM).")

            return scrapedData
        } catch (error) {
            func.logger.error("❌ Gagal melakukan scraping (ESM):", error)

            if (cachedData) {
                func.logger.info("Scraping gagal, menggunakan data dari cache LowDB lama (jika ada) (ESM).")

                return cachedData 
            } else {
                throw error 
            }
        }
    }
}

export { scrapeAnimeSearch, scrapeAnimeInfo, scrapeAnimeDownload, scrapeAnimeData }