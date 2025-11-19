import os
import discord
from discord.ext import tasks, commands
from datetime import datetime
from flask import Flask
from threading import Thread


app = Flask('')


@app.route('/')
def home():
return "Bot is running on Render!"


def run():
app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))


def keep_alive():
t = Thread(target=run)
t.start()


TOKEN = os.getenv("TOKEN")
CHANNEL_ID = int(os.getenv("CHANNEL_ID", 0))


intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)


@bot.event
async def on_ready():
print(f"Logged in as {bot.user}")
ping_task.start()


@tasks.loop(seconds=60)
async def ping_task():
now = datetime.utcnow()
if now.minute == 20 and now.second < 5:
channel = bot.get_channel(CHANNEL_ID)
if channel:
await channel.send("⏰ Ping! It's 20 minutes past the hour.")


keep_alive()
bot.run(TOKEN)