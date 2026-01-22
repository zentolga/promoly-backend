# --- Stage 1: Builder ---
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies (openssl is needed for prisma)
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# --- Stage 2: Final Image ---
FROM node:20-slim

WORKDIR /app

# Install Chromium and all necessary shared libraries for Playwright
# This is the "brute-force" list to ensure it works on Debian/Ubuntu slim images
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz-dev \
    ca-certificates \
    fonts-freefont-ttf \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set ENV to tell Playwright to use the system-installed Chromium
# This skips the need for Playwright to download its own version
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/storage ./storage

EXPOSE 3100
CMD ["npm", "run", "start:prod"]
