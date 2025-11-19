const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
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
    .setName('setchannel')
    .setDescription('Set the channel for Turf pings this guild')
    .addChannelOption(opt => opt
      .setName('channel')
      .setDescription('Channel to post Turf pings')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: 'Please provide a valid text channel.', ephemeral: true });
    }

    const settings = loadSettings();
    settings[interaction.guildId] = settings[interaction.guildId] || {};
    settings[interaction.guildId].channelId = channel.id;
    saveSettings(settings);

    await interaction.reply({ content: `Turf channel set to ${channel}`, ephemeral: true });
  },
};