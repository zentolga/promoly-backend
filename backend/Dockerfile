# --- Stage 1: Builder ---
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
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

# Install system dependencies required for Chromium execution
RUN apt-get update && apt-get install -y \
    libnss3 \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz-dev \
    ca-certificates \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Set ENV to tell Playwright where to look
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/storage ./storage

# Explicitly install chromium in the FINAL stage to ensure it exists in this layer
RUN npx playwright install chromium

EXPOSE 3100
CMD ["npm", "run", "start:prod"]
