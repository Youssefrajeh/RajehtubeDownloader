# Use a Node.js base image
FROM node:20-slim

# Install system dependencies: python3 (for yt-dlp) and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally using curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port (Render will override this, but 3000 is default)
EXPOSE 3000

# Start the application with dynamic port support
CMD npx next start -p ${PORT:-3000}
