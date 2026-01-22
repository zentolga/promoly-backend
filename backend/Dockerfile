FROM mcr.microsoft.com/playwright:v1.41.0-jammy AS builder

WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Pin Playwright version to match the base image (optional but good practice)
RUN npm install
# Explicitly install the browser version matching the package.json lock
RUN npx playwright install chromium

COPY . .

RUN npx prisma generate
RUN npm run build

# --- Stage 2: Final Image ---
FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /app

# Ensure Playwright looks in the correct system location
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copy storage folder for static assets
COPY --from=builder /app/storage ./storage

# Explicitly install chromium again in the final stage to be safe, or rely on base image + ENV
# Since base image has it, just setting ENV might be enough, but 'install' is safer to ensure version match
RUN npx playwright install chromium

EXPOSE 3100
CMD ["npm", "run", "start:prod"]
