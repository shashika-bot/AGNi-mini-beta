const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download YouTube Audio",
    category: "download",
    filename: __filename,
  },
  async (bot, mek, m, { from, args, reply }) => {
    try {
      const q = args.join(" ");
      if (!q) return reply("❌ නමක් හරි / YouTube link එකක් දෙන්න 🎵");

      // 1) Search video
      let url = q;
      try {
        new URL(q);
      } catch {
        const s = await yts(q);
        if (!s?.videos?.length) return reply("❌ ගීතය හමු නොවීය!");
        url = s.videos[0].url;
      }

      // 2) Get video details
      const info = await ytdl.getInfo(url);
      const details = info.videoDetails;

      // 3) Send thumbnail + details
      await bot.sendMessage(
        from,
        {
          image: { url: details.thumbnails[0].url },
          caption: `🎶 *${details.title}*\n👀 Views: ${details.viewCount}\n⏱ Duration: ${Math.floor(details.lengthSeconds/60)} min\n🔗 ${url}`
        },
        { quoted: mek }
      );

      // 4) Directly send audio file
      const audioStream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

      await bot.sendMessage(
        from,
        {
          audio: audioStream,  // <-- Direct file!
          mimetype: "audio/mpeg",
          fileName: `${details.title}.mp3`,
        },
        { quoted: mek }
      );

      reply("✅ ගීතය Directly ගෙනා! 🎵");
    } catch (e) {
      console.error(e);
      reply("❌ Error: " + e.message);
    }
  }
);
