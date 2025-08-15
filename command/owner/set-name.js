export default {
    command: ["setname"],
    name: "set-name",
    tags: "owner",

    owner: true,

    run: async(m, { conn }) => {
        let text = m.isQuoted && !m.text ? m.quoted.body : m.text
        if (!text) return m.reply("Example : .setname cerydra bot")

        conn.updateProfileName(text)
        m.reply("Successfully changed name")
    }
}