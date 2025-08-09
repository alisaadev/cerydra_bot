export default {
    command: ["owner"],
    name: "owner",
    tags: "main",

    run: async(m, { conn }) => {
        let name = await conn.getName(owner[0] + "@s.whatsapp.net")
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=Mobile;waid=${owner[0]}:+${owner[0]}\nX-WA-BIZ-NAME:${name}\nEND:VCARD`

        conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ displayName: name, vcard }] } }, { quoted: m })
    }
}
