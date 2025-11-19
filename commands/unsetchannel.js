const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const SETTINGS_PATH = './guild-settings.json';

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH)); } catch (e) { return {}; }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unsetchannel')
    .setDescription('Remove the configured Turf channel and fall back to the default selection')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const settings = loadSettings();
    if (!settings[interaction.guildId] || !settings[interaction.guildId].channelId) {
      return interaction.reply({ content: 'No Turf channel is configured for this server.', ephemeral: true });
    }

    delete settings[interaction.guildId].channelId;
    saveSettings(settings);

    await interaction.reply({ content: 'Turf channel configuration removed. Bot will use a default writable channel.', ephemeral: true });
  },
};
