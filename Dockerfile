# =========================================================================
# NumeriX Financial Calculator — Production Multi-Stage Container (v2.3.1)
# Air-gapped & Offline Ready (Zero external runtime dependencies)
# =========================================================================

# Stage 1: Build production frontend & server bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies for build stage
RUN npm install

# Copy application source code
COPY . .

# Compile Vite client assets and bundle server into dist/server.cjs
RUN npm run build:all

# =========================================================================
# Stage 2: Minimal, Hardened Production Runtime
# =========================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install tini for reliable POSIX signal handling (SIGTERM, SIGINT) and zombie reaping
RUN apk add --no-cache tini tzdata

# Production Environment Settings
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    TZ=Asia/Tehran \
    NUMERIX_DATA_DIR=/data/numerix

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built production artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent storage directory and set non-root ownership
RUN mkdir -p /data/numerix && chown -R node:node /data/numerix /app

# Switch to non-root unprivileged user
USER node

# Expose internal service port
EXPOSE 3000

# Persistent volume definition for calculator workspace data
VOLUME ["/data/numerix"]

# Fully self-contained offline healthcheck (zero curl/wget dependency)
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/healthz', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Use tini as PID 1 init process to cleanly manage child processes & signal forwarding
ENTRYPOINT ["/sbin/tini", "--"]

# Start production server
CMD ["node", "dist/server.cjs"]
