# Use official Node.js 18 image
FROM node:18-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# Copy sources
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the bot
CMD [ "node", "index.js" ]
