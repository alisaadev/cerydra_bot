export default {
    command: ["setname"],
    name: "set-name",
    tags: "owner",

    owner: true,

    run: async(m, { conn }) => {
        let text = m.isQuoted && !m.text ? m.quoted.body : m.text
        if (!text) return m.reply("What name do you want to give it?")

        conn.updateProfileName(text)
        m.reply("Successfully changed name")
    }
}