// plugins/developer.js
const { cmd } = require("../command");

cmd(
  {
    pattern: "developer",
    alias: ["dev", "creator"],
    desc: "Show developer info with image and intro text",
    category: "info",
    react: "👨‍💻",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply }) => {
    const developerInfo = {
      name: "Shashika Dilshan",
      number: "wa.me/94776907496",
      github: "https://github.com/Shashika-sl",
      note: "බොට් එක ගැන support එකක් ඕන නම් msg එකක් දාන්න!",
      image:
        "https://i.ibb.co/SDWZFh23/malvin-xd.jpg",
    };

    // STEP 1: Intro reaction (optional)
    await malvin.sendMessage(mek.key.remoteJid, {
      react: { text: "👨‍💻", key: mek.key },
    });

    // STEP 2: Intro Message
    await malvin.sendMessage(
      mek.key.remoteJid,
      { text: "👋 *HEY I AM A DEVELOPER!*" },
      { quoted: mek }
    );

    // STEP 3: Developer Info with Image
    const caption = `
*👨‍💻 Developer Info*

👤 *Name:* ${developerInfo.name} 

📞 *Contact:* ${developerInfo.number}

💻 *GitHub:* ${developerInfo.github}

📝 *Note:* ${developerInfo.note}
    `.trim();

    await malvin.sendMessage(
      mek.key.remoteJid,
      { image: { url: developerInfo.image }, caption },
      { quoted: mek }
    );
  }
);
