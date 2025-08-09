export default {
    command: ["setpp", "setprofile"],
    name: "set-profile",
    tags: "owner",

    owner: true,

    run: async(m, { conn }) => {
        if (!m.isMedia || m.mime !== "image/jpeg") return m.reply("Where are the photos?")

        const quoted = m.isQuoted ? m.quoted : m
        const media = await quoted.download()

        conn.updateProfilePicture(conn.user.jid, media)
        m.reply("Successfully changed profile photo")
    }
}