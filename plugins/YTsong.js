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
    desc: "Download Song",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🌚❤️");

      // Search YouTube
      const search = await yts(q);
      const data = search.videos[0];
      if (!data) return reply("❌ Video not found!");

      // Metadata
      let desc = `
*❤️ agni SONG DOWNLOADER ❤️*

👻 *title* : ${data.title}
👻 *description* : ${data.description}
👻 *time* : ${data.timestamp}
👻 *ago* : ${data.ago}
👻 *views* : ${data.views}
👻 *url* : ${data.url}

𝐌𝐚𝐝𝐞 𝐛𝐲 Shashika
`;

      // Send thumbnail & metadata
      await robin.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

      // Validate duration (limit 30 min)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];
      if (totalSeconds > 1800) return reply("⏱️ Audio limit is 30 minutes");

      // Prepare file path
      const fileName = `${data.title}.mp3`.replace(/[\/\\?%*:|"<>]/g, "_");
      const filePath = path.join(__dirname, fileName);

      // Download audio with ytdl
      const stream = ytdl(data.url, { filter: "audioonly", quality: "highestaudio" });
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      writeStream.on("finish", async () => {
        try {
          // Send as audio
          await robin.sendMessage(
            from,
            { audio: { url: filePath }, mimetype: "audio/mpeg" },
            { quoted: mek }
          );

          // Send as document
          await robin.sendMessage(
            from,
            {
              document: { url: filePath },
              mimetype: "audio/mpeg",
              fileName: fileName,
              caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 Shashika",
            },
            { quoted: mek }
          );

          // Delete file after sending
          fs.unlinkSync(filePath);
          reply("*Thanks for using my bot* 🌚❤️");
        } catch (err) {
          console.log(err);
          reply("❌ Failed to send audio/document");
          fs.existsSync(filePath) && fs.unlinkSync(filePath);
        }
      });

      // Handle stream errors (like MinigetError 410)
      stream.on("error", (err) => {
        console.log(err);
        reply("❌ Cannot download this video, maybe removed or private.");
      });
    } catch (e) {
      console.log(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
