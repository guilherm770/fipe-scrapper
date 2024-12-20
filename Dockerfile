FROM node:slim AS app

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set Puppeteer cache directory
ENV PUPPETEER_CACHE_DIR=/home/appuser/.cache/puppeteer

# Create a non-root user and group
RUN groupadd -r appgroup && useradd -r -g appgroup -m appuser

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Switch to the non-root user for subsequent steps
USER appuser

# Create application directory
WORKDIR /home/appuser/app

# Copy package.json and package-lock.json first
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies
RUN npm install --no-optional

# Copy the rest of the application files
COPY --chown=appuser:appgroup src/ ./src

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["node", "src/app.js"]
