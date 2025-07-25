export default {
  before: async (m, { conn }) => {
    if (m.mentions[0].includes(conn.user?.jid)) m.reply("Yes, what is up?");
  },
};
