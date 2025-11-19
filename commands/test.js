const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField } = require('discord.js');
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

    // Ensure command is used in a guild
    if (!interaction.guild) {
      return interaction.editReply('This command must be used in a server (guild).');
    }

    const settings = loadSettings();
    const guildSettings = settings[interaction.guildId] || {};
    const configuredChannelId = guildSettings.channelId;

    let sendChannel = null;

    // Try configured channel first
    if (configuredChannelId) {
      sendChannel = await interaction.client.channels.fetch(configuredChannelId).catch(() => null);
      // verify it's a guild text channel
      if (sendChannel && sendChannel.type !== ChannelType.GuildText && !sendChannel.isThread?.()) {
        sendChannel = null;
      }
    }

    // If no configured channel or configured channel invalid, try current channel (if valid)
    if (!sendChannel) {
      const current = interaction.channel;
      if (current && (current.type === ChannelType.GuildText || current.isThread?.())) {
        sendChannel = current;
      }
    }

    // Final fallback: find first writable text channel in the guild where the bot can send messages
    if (!sendChannel) {
      sendChannel = interaction.guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText)
        .filter(c => {
          try {
            const perms = c.permissionsFor(interaction.guild.members.me);
            return perms && perms.has(PermissionsBitField.Flags.SendMessages) && perms.has(PermissionsBitField.Flags.ViewChannel);
          } catch (e) {
            return false;
          }
        })
        .sort((a, b) => a.position - b.position)
        .first();
    }

    if (!sendChannel) {
      return interaction.editReply('No available text channel found where I can send messages. Please set one with /setchannel or give the bot Send Messages and View Channel in a channel.');
    }

    // Check send permission explicitly
    const botMember = interaction.guild.members.me;
    const perms = sendChannel.permissionsFor(botMember);
    if (!perms || !perms.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.editReply(`I don't have permission to send messages in ${sendChannel}. Please give me Send Messages (and View Channel) permissions there.`);
    }

    try {
      const canMentionEveryone = perms.has(PermissionsBitField.Flags.MentionEveryone);
      const content = canMentionEveryone ? '@everyone Turf in 5 Minutes!' : 'Turf in 5 Minutes!';
      await sendChannel.send({ content });
      await interaction.editReply(`Test message sent to ${sendChannel}.`);
    } catch (err) {
      console.error('Failed to send test message:', err);
      await interaction.editReply('Failed to send the test message — check bot permissions, channel visibility, and channel type. See bot logs for details.');
    }
  },
};
