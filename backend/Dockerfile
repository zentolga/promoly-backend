FROM mcr.microsoft.com/playwright:v1.41.0-jammy AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npx playwright install chromium
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/storage ./storage

RUN npx playwright install chromium

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
