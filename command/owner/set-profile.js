export default {
    command: ["setpp", "setprofile"],
    name: "set-profile",
    tags: "owner",

    owner: true,

    run: async(m, { conn }) => {
        const quoted = m.isQuoted ? m.quoted : m

        if (!quoted.isMedia) return m.reply("Kirim atau reply foto dengan command ." + m.command)
        if (quoted.mime !== "image/jpeg") return m.reply("Mimetype tidak mendukung : " + quoted.mime)

        const media = await quoted.download()

        conn.updateProfilePicture(conn.user.jid, media)
        m.reply("Successfully changed profile photo")
    }
}