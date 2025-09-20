const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

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

      // Search for the video
      const search = await yts(q);
      const data = search.videos[0];
      if (!data) return reply("❌ Video not found!");

      // Metadata description
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

      // Send metadata thumbnail
      await robin.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

      // Validate song duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱️ Audio limit is 30 minutes");
      }

      // Download audio to local file
      const fileName = `${data.title}.mp3`.replace(/[\/\\?%*:|"<>]/g, "_"); // remove invalid filename chars
      const filePath = path.join(__dirname, fileName);
      const stream = ytdl(data.url, { filter: "audioonly", quality: "highestaudio" });
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      writeStream.on("finish", async () => {
        // Send as audio
        await robin.sendMessage(
          from,
          { audio: { url: filePath }, mimetype: "audio/mpeg" },
          { quoted: mek }
        );

        // Send as document for download
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

        // Delete local file after sending
        fs.unlinkSync(filePath);

        reply("*Thanks for using my bot* 🌚❤️");
      });
    } catch (e) {
      console.log(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
