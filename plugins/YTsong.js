const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const events = require("events");

// Fix MaxListenersExceededWarning
events.EventEmitter.defaultMaxListeners = 50;

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

      // 1️⃣ Get YouTube URL
      let url = q;
      try {
        new URL(q); // Valid URL?
      } catch {
        const search = await yts(q);
        if (!search?.videos?.length) return reply("❌ ගීතය හමු නොවීය!");
        url = search.videos[0].url;
      }

      // 2️⃣ Get video info
      let info;
      try {
        info = await ytdl.getInfo(url);
      } catch (e) {
        return reply("❌ Video unavailable / removed.");
      }

      const details = info.videoDetails;
      const fileName = `${details.title}.mp3`.replace(/[\/\\?%*:|"<>]/g, "_");
      const filePath = path.join(__dirname, fileName);

      // 3️⃣ Send thumbnail + details
      await bot.sendMessage(
        from,
        {
          image: { url: details.thumbnails[0].url },
          caption: `🎶 *${details.title}*\n👀 Views: ${details.viewCount}\n⏱ Duration: ${Math.floor(details.lengthSeconds/60)} min\n🔗 ${url}`,
        },
        { quoted: mek }
      );

      // 4️⃣ Download audio
      const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      stream.on("error", (err) => {
        console.error(err);
        reply("❌ Cannot download this video, maybe removed or private.");
      });

      writeStream.on("finish", async () => {
        try {
          // 5️⃣ Send direct audio
          await bot.sendMessage(
            from,
            { audio: fs.createReadStream(filePath), mimetype: "audio/mpeg", fileName: fileName },
            { quoted: mek }
          );

          // 6️⃣ Send as document (optional)
          await bot.sendMessage(
            from,
            { document: fs.createReadStream(filePath), mimetype: "audio/mpeg", fileName: fileName },
            { quoted: mek }
          );

          // 7️⃣ Cleanup
          fs.unlinkSync(filePath);
          reply("✅ ගීතය send කරන ලදී!");
        } catch (e) {
          console.error(e);
          reply("❌ Failed to send audio/document");
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    } catch (e) {
      console.error(e);
      reply("❌ Error: " + e.message);
    }
  }
);
