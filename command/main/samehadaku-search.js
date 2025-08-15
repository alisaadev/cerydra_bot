import * as scrape from "../../system/lib/samehadaku.js"

export default {
    command: ["samesearch", "samehadakusearch"],
    name: "samehadaku-search",
    tags: "main",
    
    run: async(m, { conn, text }) => {
        if (!text) return m.reply("Anime apa yang ingin kamu cari?")

        const result = await scrape.scrapeAnimeSearch(text)
        const results = await scrape.scrapeAnimeData()

        if (result.length === 0) return m.reply("Anime tidak ditemukan")

        const rows = result.map((anime) => {
            return {
                header: "✦ " + anime.judulAnime,
                title: "Rating: " + anime.rating + ", Type: " + anime.typeAnime,
                description: anime.status,
                id: ".same --info " + anime.linkAnime
            }
        })
        const nativeFlowInfo = {
            name: "single_select",
            paramsJson: JSON.stringify({
                title: "Click Here",
                sections: [{
                    title: "Search Results",
                    highlight_label: "Tercocok",
                    rows: rows
                }]
            })
        }

        await conn.sendMessage(m.chat, {
            text: "*Information :*\n" + results.information.replace(/!/g, "").replace(/ - /, "\n").trim(),
            title: "Hasil Pencarian dari : " + text,
            footer: "Cepat, mudah, dan selalu update",
            buttons: [{ buttonId: "action", buttonText: { displayText: "action" }, type: 4, nativeFlowInfo }]
        }, { quoted: m })
    }
}