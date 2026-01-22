# --- Stage 1: Builder ---
FROM mcr.microsoft.com/playwright:v1.41.0-jammy AS builder

WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# --- Stage 2: Final Image ---
FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Critical: Copy storage for images
COPY --from=builder /app/storage ./storage

EXPOSE 3100
CMD ["npm", "run", "start:prod"]
