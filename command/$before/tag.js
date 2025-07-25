async function yuukaGPT(query) {
    return new Promise(async (resolve, reject) => {
        const response = await func.axios("https://api.yanzgpt.my.id/v1/chat", { headers: { authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy", "content-type": "application/json" },
            data: {
                messages: [{
                    role: "system",
                    content: "Kamu adalah AI yang bernama yuuka dengan kepribadian sopan, profesional dan mudah di ajak bicara"
                },{
                    role: "user",
                    content: query
                }],
                model: "yanzgpt-legacy-72b-v3.5"
            },
            method: "POST"
        })
        resolve(response.data)
    })
}

export default {
    before: async(m, { conn }) => {
        if (m.mentions.includes(conn.user?.jid) {
            let query = !m.text ? "Halo yuuka" : m.text

            let result = await yuukaGPT(query)
            m.reply(result.choices[0].message.content)
        }
    }
}