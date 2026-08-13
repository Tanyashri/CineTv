# ─── Build Stage ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY frontend ./frontend

RUN npm run build --workspace=frontend

# ─── Production Stage ─────────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# SPA routing support
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
