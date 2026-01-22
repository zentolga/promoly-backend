# --- Stage 1: Builder ---
FROM node:20-slim AS builder

WORKDIR /app

# Set Custom Path for Playwright Browsers IN BUILDER
ENV PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright

# Install build dependencies
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
# Install Chromium into the CUSTOM path defined by ENV
RUN npx playwright install chromium

COPY . .

RUN npx prisma generate
RUN npm run build

# --- Stage 2: Final Image ---
FROM node:20-slim

WORKDIR /app

# Install system dependencies required for Chromium execution (even if binary is copied)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz-dev \
    ca-certificates \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Set ENV to tell Playwright where to look (Must match builder)
ENV PLAYWRIGHT_BROWSERS_PATH=/app/ms-playwright

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/storage ./storage

# CRITICAL FIX: Copy the installed browsers from Builder to Final
COPY --from=builder /app/ms-playwright /app/ms-playwright

EXPOSE 3100
CMD ["npm", "run", "start:prod"]
