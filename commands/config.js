const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

// Ici on garde les systèmes activés pour chaque serveur
let serverConfig = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configurer les systèmes du bot pour ce serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName("systeme")
        .setDescription("Choisir un système à activer ou désactiver")
        .setRequired(true)
        .addChoices(
          { name: "🎮 Jeux", value: "games" },
          { name: "🔨 Modération", value: "moderation" },
          { name: "📊 Statistiques", value: "stats" },
          { name: "😂 Fun", value: "fun" }
        )
    )
    .addStringOption(option =>
      option.setName("action")
        .setDescription("Activer ou désactiver le système")
        .setRequired(true)
        .addChoices(
          { name: "Activer ✅", value: "enable" },
          { name: "Désactiver ❌", value: "disable" }
        )
    ),

  async execute(interaction) {
    const systeme = interaction.options.getString("systeme");
    const action = interaction.options.getString("action");
    const guildId = interaction.guild.id;

    if (!serverConfig[guildId]) {
      serverConfig[guildId] = { games: false, moderation: false, stats: false, fun: false };
    }

    serverConfig[guildId][systeme] = action === "enable";

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuration mise à jour")
      .setDescription(`Le système **${systeme}** a été **${action === "enable" ? "activé ✅" : "désactivé ❌"}**.`)
      .setColor(action === "enable" ? 0x57F287 : 0xED4245)
      .setFooter({ text: `Serveur: ${interaction.guild.name}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
