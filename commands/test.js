const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const SETTINGS_PATH = './guild-settings.json';

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH)); } catch (e) { return {}; }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Send a test Turf message immediately')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const settings = loadSettings();
    const guildSettings = settings[interaction.guildId] || {};
    const channelId = guildSettings.channelId;

    let sendChannel = null;
    if (channelId) {
      sendChannel = await interaction.client.channels.fetch(channelId).catch(() => null);
    }
    if (!sendChannel) {
      // fallback to current channel
      sendChannel = interaction.channel;
    }
    if (!sendChannel) {
      return interaction.editReply('No channel available to send the test message.');
    }

    try {
      const perms = sendChannel.permissionsFor(interaction.guild.members.me);
      const canMentionEveryone = perms ? perms.has('MentionEveryone') : false;
      const content = canMentionEveryone ? '@everyone Turf in 5 Minutes!' : 'Turf in 5 Minutes!';
      await sendChannel.send({ content });
      await interaction.editReply(`Test message sent to ${sendChannel}.`);
    } catch (err) {
      console.error('Failed to send test message:', err);
      await interaction.editReply('Failed to send the test message — check bot permissions and channel visibility.');
    }
  },
};
