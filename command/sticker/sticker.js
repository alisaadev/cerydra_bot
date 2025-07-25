export default {
  command: ["sticker", "stiker", "s"],
  description: "Mengubah foto menjadi stiker",
  name: "sticker",
  tags: "sticker",

  run: async (m, { conn }) => {
    let quoted = m.quoted ? m.quoted : m;

    if (quoted.isMedia) {
      let media = await quoted.download();
      m.reply(media, { asSticker: true });
    } else if (m.args[0] && func.isUrl(m.args[0])) {
      m.reply(quoted.args[0], { asSticker: true });
    } else m.reply(`Kirim atau reply foto dengan command .${m.command}`);
  },
};
