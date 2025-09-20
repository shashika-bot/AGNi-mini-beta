const { cmd } = require("../command");
const config = require("../config");

cmd(
  {
    pattern: "system",
    alias: ["sys", "botstatus"],
    react: "🖥️",
    desc: "Check if the bot is in public or private mode.",
    category: "main",
    filename: __filename,
  },
  async (malvin, mek, m, { reply }) => {
    try {
      const mode = (config.MODE || "").toLowerCase();
      let status;

      if (mode === "public") {
        status = "🌍 Bot is running in *Public Mode*";
      } else if (mode === "private") {
        status = "🔒 Bot is running in *Private Mode*";
      } else {
        status = `⚠️ Unknown Mode: *${config.MODE || "Not Set"}*`;
      }

      await reply(`*🖥️ 𝗠𝗔𝗟𝗨 𝗫𝗗 SYSTEM STATUS*\n\n${status}`);
    } catch (e) {
      console.error("System Command Error:", e);
      await reply("❌ Error while checking bot status.");
    }
  }
);
