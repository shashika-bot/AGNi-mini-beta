const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "tt",
    react: "🎵",
    desc: "Download TikTok Video",
    category: "download",
    filename: __filename,
  },
  async (malvin, mek, m, { from, q, reply }) => {
    try {
      if (!q || !q.includes("tiktok.com"))
        return reply("❌ Please provide a valid TikTok link.");

      const { data } = await axios.get(`https://api-dylux.vercel.app/api/tiktok?url=${q}`);

      if (!data || !data.video) return reply("❌ Failed to fetch TikTok video.");

      await malvin.sendMessage(
  from,
  {
    video: { url: data.video },
    caption: `*_MALU XD TIK TOK DOWNLOADER_* 🎥\n\n👤 Author: ${data.author}`,
  },
  { quoted: mek }
);
    } catch (e) {
      console.error(e);
      reply("❌ Error: " + e.message);
    }
  }
);
