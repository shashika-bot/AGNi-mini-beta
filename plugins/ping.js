const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    desc: "Check bot latency",
    react: "🖥️",
    category: "utility",
    filename: __filename,
  },
  async (malvin, mek, m, { reply }) => {
    const start = Date.now();
    await malvin.sendMessage(mek.key.remoteJid, { text: "Pinging..." }, { quoted: mek });

    const ping = Date.now() - start;
    reply(`*🏓𝗠𝗔𝗟𝗨 𝗫𝗗 PONG!*: ${ping}ms`);
  }
);
