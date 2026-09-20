# Multi-stage Dockerfile for NumeriX Financial Calculator (v2.0.1)
# Stage 1: Build production frontend & server bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite & esbuild)
RUN npm ci

# Copy application source files
COPY . .

# Compile Vite client assets and bundle server into dist/server.cjs
RUN npm run build

# Stage 2: Minimal production runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NUMERIX_DATA_DIR=/data/numerix

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent data storage directory with proper permissions
RUN mkdir -p /data/numerix && chown -R node:node /data/numerix /app

# Switch to non-root user
USER node

# Expose container port
EXPOSE 3000

# Volume for persistent calculation data outside project directory
VOLUME ["/data/numerix"]

# Healthcheck monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
