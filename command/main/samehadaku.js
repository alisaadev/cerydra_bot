import * as scrape from "../../system/lib/samehadaku.js"

export default {
    command: ["same", "samehadaku"],
    name: "samehadaku",
    tags: "main",

    run: async(m, { conn, args }) => {
        const value = args.slice(1).join(" ")
        const results = await scrape.getAnimeDataFromCacheOrScrape()

        switch (args[0]) {
            case "--info": {
                if (!value) return

                const result = await scrape.scrapeAnimeInfo(value)
                const caption = `*${result.latin}* (${result.japanese})\n\n• *Status:* ${result.status}\n• *Type:* ${result.type}\n• *Source:* ${result.source}\n• *Duration:* ${result.duration}\n• *Total Episode:* ${result.total_episode}\n• *Season:* ${result.season}\n• *Studio:* ${result.studio}\n• *Producers:* ${result.producers}\n• *Released:* ${result.released}\n• *Genre:* ${result.genre}\n• *Rating:* ${result.rating}`
                const rows = result.episode.map((anime) => {
                    const words = anime.name.split(" ")
                    const abbreviation = words.map(word => {
                        if (word === "Season" || word === "Episode" || !isNaN(word)) return " " + word

                        return word.charAt(0).toUpperCase()
                    }).join("")

                    return {
                        title: "✦ " + abbreviation.replace("[", ""),
                        description: anime.date,
                        id: "" + anime.link
                    }
                })
                const nativeFlowInfo = {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "Episode",
                        sections: [{
                            title: "Episode",
                            highlight_label: result.status === "Ongoing" ? "Terbaru" : "Ending",
                            rows: rows
                        }]
                    })
                }

                await conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption }, { quoted: m })
                conn.sendMessage(m.chat, {
                    text: result.latin,
                    title: "List Episode :",
                    footer: "Cepat, mudah, dan selalu update",
                    buttons: [{ buttonId: "action", buttonText: { displayText: "action" }, type: 4, nativeFlowInfo }]
                }, { quoted: m })
                break
            }

            case "--top": {
                const result = results.topAnime
                const rows = result.map((anime) => {
                    return {
                        header: "✦ " + anime.judulAnime,
                        title: anime.peringkatTop,
                        description: "Rating: " + anime.rating,
                        id: ".same --info " + anime.linkAnime
                    }
                })
                const nativeFlowInfo = {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "Top Anime",
                        sections: [{
                            title: "Top Anime",
                            highlight_label: "Teratas",
                            rows: rows
                        }]
                    })
                }

                await conn.sendMessage(m.chat, {
                    text: "*Information :*\n" + results.information.replace(/!/g, "").replace(/ - /, "\n").trim(),
                    title: "Top 10 Anime Minggu Ini",
                    footer: "Cepat, mudah, dan selalu update",
                    buttons: [{ buttonId: "action", buttonText: { displayText: "action" }, type: 4, nativeFlowInfo }]
                }, { quoted: m })
                break
            }

            default:
                const result = results.latestAnime
                const rows = result.map((anime) => {
                    return {
                        header: "✦ " + anime.judulAnime,
                        title: "Episode " + anime.episode,
                        description: anime.rilis,
                        id: ".same --info " + anime.linkAnime
                    }
                })
                const nativeFlowInfo = {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "Anime Terbaru",
                        sections: [{
                            title: "Anime Terbaru",
                            highlight_label: "Terbaru",
                            rows: rows
                        }]
                    })
                }

                await conn.sendMessage(m.chat, {
                    text: "*Information :*\n" + results.information.replace(/!/g, "").replace(/ - /, "\n").trim(),
                    title: "Temukan episode dan info terbaru",
                    footer: "Cepat, mudah, dan selalu update",
                    buttons: [
                        { buttonId: ".same --top", buttonText: { displayText: "🌟 Top Anime" }, type: 1 },
                        { buttonId: "action", buttonText: { displayText: "action" }, type: 4, nativeFlowInfo }
                    ]
                }, { quoted: m })
                break
        }
    }
}