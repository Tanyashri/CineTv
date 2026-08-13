# ─── Build Stage ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY backend ./backend

RUN npx prisma generate --schema=./backend/prisma/schema.prisma
RUN npm run build --workspace=backend

# ─── Production Stage ─────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 appuser

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

RUN mkdir -p /app/backend/logs && chown -R appuser:nodejs /app

USER appuser

WORKDIR /app/backend

EXPOSE 4000

CMD ["node", "dist/server.js"]
