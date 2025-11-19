// Run this to register commands to a single guild for testing. Set DISCORD_TOKEN, CLIENT_ID, TEST_GUILD_ID in .env
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.TEST_GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('Missing required env variables. Please set DISCORD_TOKEN, CLIENT_ID, TEST_GUILD_ID in .env');
  process.exit(1);
}

const commands = [];
const commandFiles = fs.existsSync('./commands') ? fs.readdirSync('./commands').filter(f => f.endsWith('.js')) : [];
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command && command.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Registering ${commands.length} commands to guild ${guildId}`);
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    console.log('Commands registered successfully.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();
