# Turfbot2

A simple Discord bot that sends an hourly message at 20 minutes past each hour: "Turf in 5 Minutes!"

This repository is prepared to run 24/7 on web hosting platforms (Render, Railway, Fly.io, Heroku) by exposing a small web server for health checks and providing a Dockerfile.

Features
- Sends the message to the first text channel in each guild where the bot has permission to send messages.
- Attempts to use @everyone (will only ping if the bot has the "Mention Everyone" permission).
- Timezone is configurable via an environment variable (defaults to UTC).
- Includes a web health endpoint so many hosts will keep the service alive.

Requirements
- Node.js 18+
- A Discord bot token
- Invite the bot to your server with:
  - Send Messages
  - (Optional but required to actually ping everyone) Mention Everyone

Setup (local)
1. Clone the repo.
2. Create a `.env` file from `.env.example` and add your DISCORD_TOKEN.
3. Install dependencies:

```
npm install
```

4. Start locally:

```
npm start
```

Deploying (recommended hosting)
- Render: Create a new Web Service, connect to this GitHub repo, set the build command to `npm install` and the start command to `npm start`. Set the DISCORD_TOKEN environment variable in the service.

- Railway: Create a new project, deploy from this repository, and set the environment variable DISCORD_TOKEN.

- Fly.io: Build with the Dockerfile and deploy. Set the DISCORD_TOKEN secret with `fly secrets set DISCORD_TOKEN=...`.

Notes
- If the bot does not ping @everyone, ensure it has the "Mention Everyone" permission in the server or channel.
- The cron schedule is configured to run at minute 20 of every hour: `20 * * * *`.
- The web endpoints `/` and `/healthz` respond with simple text so hosting platforms can perform health checks.
