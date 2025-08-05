import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

const cache = func.path.join(process.cwd(), "/storage/cache_anime.json")
const data = { animeData: null, lastScrapeTime: 0 }
const adapter = new JSONFile(cache)
const db = new Low(adapter, data)
const cache_duration_ms = 60 * 60 * 1000

await db.read()
await db.write()

async function fetchDataFromJina(url) {
    try {
        const config = {
            headers: {
                "Authorization": "Bearer jina_4fd0ab04bdad480d9c0a62ddaa4c61c5ZiLJb_HIVkwOPMGXOqjB_lFT8Fwb",
                "X-Return-Format": "html"
            }
        }

        const baseUrl = "https://r.jina.ai"
        const requestUrl = `${baseUrl}/${encodeURIComponent(url)}`
        const response = await func.axios.get(requestUrl, config)

        return response.data
    } catch (error) {
        func.logger.error("❌ Terjadi kesalahan saat mengambil data dari Jina AI:")
    }
}

async function scrapeAnimeHome() {
    const data = await func.axios.get(same, { "User Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36" })
    const $ = func.cheerio.load(data.data)
    const latestAnimeResults = []
    const topAnimeResults = []
    const info = $("div.wp-block-group > p").eq(1).find("strong").text().trim()

    $('li[itemscope="itemscope"] > div.dtla').each((index, element) => {
        const judulAnime = $(element).find("h2.entry-title a").text().trim()
        const href = $(element).find("h2.entry-title a").attr("href")?.trim()
        const episode = $(element).find("span > author").eq(0).text().trim()
        const rilis = $(element).find("span").eq(2).text().trim()

        latestAnimeResults.push({
            judulAnime: judulAnime,
            linkAnime: href,
            episode: episode,
            rilis: rilis
        })
    })

    $("div.topten-animesu > ul > li").each((index, element) => {
        const linkElement = $(element).find("a.series")
        const judulElement = $(element).find("span.judul")
        const ratingElement = $(element).find("span.rating")
        const topElement = $(element).find("b.is-topten > b")

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

    $("div.animposx > a").each((index, element) => {
        const href = $(element).attr("href").trim()
        const judulAnime = $(element).find("div.data > div.title").text().trim()
        const typeAnime = $(element).find("div.content-thumb > div.type").text().trim()
        const rating = $(element).find("div.content-thumb > div.score").text().trim()
        const status = $(element).find("div.data > div.type").text().trim()

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

    $("div.spe > span").each((index, element) => {
        const label = $(element).find("b").text().trim()
        const value = $(element).text().replace(label, "").trim()
        const key = label.toLowerCase().replace(/:/g, "").replace(/ /g, "_")

        infoAnime[key] = value
    })

    $("div.genre-info > a").each((index, element) => {
        const genre = $(element).text().trim()
        genres.push(genre)
    })

    $("li > div.epsleft").each((index, element) => {
        const href = $(element).find("span.lchx > a").attr("href").trim()
        const text = $(element).find("span.lchx > a").text().trim()
        const date = $(element).find("span.date").text().trim()

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

async function getAnimeDataFromCacheOrScrape(url) {
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

export { getAnimeDataFromCacheOrScrape, scrapeAnimeSearch, scrapeAnimeInfo }