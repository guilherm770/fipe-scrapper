FROM node:slim AS app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/home/appuser/.cache/puppeteer

# Install necessary packages
RUN apt-get update && apt-get install -y \
    gnupg \
    wget \
    && wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and set permissions
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies as root
RUN npm install --no-optional

# Copy the rest of the application
COPY src/ ./src/

# Create a non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app appuser \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "src/app.js"]