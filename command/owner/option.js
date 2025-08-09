export default {
    command: ["option", "switch"],
    name: "options",
    tags: "owner",

    owner: true,

    run: async(m, { args }) => {
        switch (args[0]) {
            case "read": {
                if (settings.autoread) {
                    settings.autoread = false
                    m.reply("Disable autoread mode")
                } else {
                    settings.autoread = true
                    m.reply("Enable autoread mode")
                }
                break
            }

            case "mode": {
                if (settings.public) {
                    settings.public = false
                    m.reply("Disable public mode")
                } else {
                    settings.public = true
                    m.reply("Enable public mode")
                }
                break
            }

            default:
                m.reply("Example : .option read / .option mode")
                break
        }
    }
}