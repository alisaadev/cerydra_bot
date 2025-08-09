export default {
    command: ["ping", "speed"],
    name: "speed",
    tags: "main",

    run: async(m, { conn }) => {
        const start = Date.now()
        const pesan = await conn.sendMessage(m.chat, { text: "Pong!" }, { quoted: m })

        const end = Date.now()
        const sped = end - start
        const speed = (sped / 1000).toFixed(2)

        await func.sleep(1500)
        conn.sendMessage(m.chat, { text: `Kecepatan respon: ${speed} ms`, edit: pesan.key }, { quoted: m })
    }
}