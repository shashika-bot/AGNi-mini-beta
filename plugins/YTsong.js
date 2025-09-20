const { exec } = require("child_process");
const fs = require("fs");
const yts = require("yt-search");
const { cmd } = require("../command");

cmd(
  {
    pattern: "song",
    desc: "Download YouTube MP3",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply }) => {
    try {
      const q = args.join(" ");
      if (!q) return reply("❌ Provide a song name or YouTube URL!");

      let url = q;
      if (!q.startsWith("http")) {
        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found!");
        url = search.videos[0].url;
      }

      const output = `song_${Date.now()}.mp3`;
      reply("⏳ Downloading... please wait...");

      exec(
        `yt-dlp -x --audio-format mp3 -o "${output}" "${url}"`,
        async (err) => {
          if (err) {
            console.error(err);
            return reply("❌ Download failed!");
          }

          const buffer = fs.readFileSync(output);
          await conn.sendMessage(
            from,
            { audio: buffer, mimetype: "audio/mpeg", fileName: "song.mp3" },
            { quoted: mek }
          );

          fs.unlinkSync(output);
          reply("✅ Song sent!");
        }
      );
    } catch (e) {
      console.error(e);
      reply("❌ Error: " + e.message);
    }
  }
);
