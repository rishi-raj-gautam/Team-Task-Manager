# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Only copy the built output — no node_modules, no source
COPY --from=builder /app/dist ./dist

RUN npm install -g serve

EXPOSE 3000

CMD serve -s dist -l ${PORT:-3000}
