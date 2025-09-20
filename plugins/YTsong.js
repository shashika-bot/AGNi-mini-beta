const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download YouTube Audio",
    category: "download",
    filename: __filename,
  },
  async (malvin, mek, m, { from, args, reply }) => {
    try {
      const q = args.join(" ");
      if (!q) return reply("*Provide a name or a YouTube link.* 🎵❤️");

      // 1) Find the URL
      let url = q;
      try {
        url = new URL(q).toString();
      } catch {
        const s = await yts(q);
        if (!s?.videos?.length) return reply("❌ No videos found!");
        url = s.videos[0].url;
      }

      // 2) Validate URL
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        return reply("❌ Invalid YouTube URL!");
      }

      // 3) Fetch metadata
      let info;
      try {
        const searchResult = await yts(url);
        if (!searchResult?.videos?.length) {
          return reply("❌ Failed to fetch video metadata!");
        }
        info = searchResult.videos[0];
      } catch (e) {
        console.error("Metadata fetch error:", e);
        return reply("❌ Error fetching video metadata: " + e.message);
      }

      // 4) Send metadata + thumbnail
      const desc = `
🧩 *Agni AUDIO DOWNLOADER* 🧩

📌 *Title:* ${info.title || "Unknown"}
⏱️ *Uploaded:* ${info.timestamp || "N/A"} (${info.ago || "N/A"})
👀 *Views:* ${info.views?.toLocaleString() || "N/A"}
🔗 *Download URL:* ${info.url || url}

━━━━━━━━━━━━━━━━━━
*ᴍᴀʟᴠɪɴ ᴛᴇᴄʜ🪀*
      `.trim();

      await malvin.sendMessage(
        from,
        { image: { url: info.thumbnail || "https://i.ibb.co/SDWZFh23/malvin-xd.jpg" }, caption: desc },
        { quoted: mek }
      );

      // 5) Audio download helper (with backup APIs)
      const downloadAudio = async (videoUrl) => {
        const apis = [
          `https://api.giftedtech.my.id/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
          `https://dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
        ];

        for (const apiUrl of apis) {
          try {
            const res = await axios.get(apiUrl);

            // GiftedTech API response
            if (res.data?.status && res.data?.result?.download_url) {
              const audioUrl = res.data.result.download_url;
              const title = res.data.result.title || "audio";
              const audio = await axios.get(audioUrl, { responseType: "arraybuffer" });
              return { buffer: audio.data, title };
            }

            // Dark Yasiya API response
            if (res.data?.status && res.data?.result?.link) {
              const audioUrl = res.data.result.link;
              const title = res.data.result.title || "audio";
              const audio = await axios.get(audioUrl, { responseType: "arraybuffer" });
              return { buffer: audio.data, title };
            }

          } catch (err) {
            console.error(`❌ API failed (${apiUrl}):`, err.message);
          }
        }

        throw new Error("All audio APIs failed. Please try again later.");
      };

      // 6) Download + send
      const { buffer, title } = await downloadAudio(url);
      await malvin.sendMessage(
        from,
        {
          audio: buffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${title}.mp3`,
        },
        { quoted: mek }
      );

      reply("*✅ Thanks for using my MP3 bot!* 🎵");
    } catch (e) {
      console.error("Error:", e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);
