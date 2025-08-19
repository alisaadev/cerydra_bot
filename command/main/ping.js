export default {
    command: ["ping"],
    name: "ping",
    tags: "main",

    run: async(m, { conn }) => {
        let perf = Date.now()
        await func.axios.request("https://google.com")

        let perfm = Date.now()
        let speed = ((perfm - perf) / 1000).toFixed(2)

        m.reply(`Kecepatan respon : ${speed} ms`)
    }
}