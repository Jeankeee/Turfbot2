require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits, Partials, ChannelType, PermissionsBitField } = require('discord.js');
const cron = require('node-cron');

const token = process.env.DISCORD_TOKEN;
const timezone = process.env.TIMEZONE || 'UTC';
const PORT = process.env.PORT || 3000;

if (!token) {
  console.error('ERROR: DISCORD_TOKEN not set. Create a .env file with DISCORD_TOKEN=your_token');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

function findWritableTextChannel(guild) {
  const channels = guild.channels.cache
    .filter(c => c.type === ChannelType.GuildText)
    .filter(c => {
      // permissionsFor may throw for some channels; guard it
      try {
        const perms = c.permissionsFor(guild.members.me);
        return perms && perms.has(PermissionsBitField.Flags.SendMessages);
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => a.position - b.position);
  return channels.first();
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag} — scheduling hourly Turf pings at :20 (${timezone})`);

  cron.schedule('20 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled Turf ping`);

    for (const [, guild] of client.guilds.cache) {
      try {
        const channel = findWritableTextChannel(guild);
        if (!channel) {
          console.log(`  - No writable text channel in guild ${guild.name} (${guild.id}), skipping`);
          continue;
        }

        const perms = channel.permissionsFor(guild.members.me);
        const canMentionEveryone = perms ? perms.has(PermissionsBitField.Flags.MentionEveryone) : false;
        const content = canMentionEveryone ? '@everyone Turf in 5 Minutes!' : 'Turf in 5 Minutes!';

        await channel.send({ content });
        console.log(`  - Sent to ${guild.name} -> #${channel.name} (mentionEveryone: ${canMentionEveryone})`);
      } catch (err) {
        console.error(`  - Failed to send message in guild ${guild.id}:`, err);
      }
    }
  }, {
    scheduled: true,
    timezone
  });
});

client.on('error', console.error);
client.on('shardError', console.error);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

client.login(token).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});

// Simple web server so hosting platforms consider the service "web" and keep it up
const app = express();
app.get('/', (req, res) => res.send('Turfbot is running'));
app.get('/healthz', (req, res) => res.status(200).send('ok'));

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});
