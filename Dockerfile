# Multi-stage Dockerfile for Professional Accountant Calculator
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Build production assets
RUN npm run build

# Production Stage (Lightweight Nginx)
FROM nginx:alpine

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx configuration supporting dynamic PORT (default 9330)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set default port environment variable
ENV PORT=9330

# Expose default port
EXPOSE 9330

# Startup script to substitute PORT dynamically if provided
CMD ["/bin/sh", "-c", "sed -i 's/listen [0-9]*;/listen '\"${PORT:-9330}\"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
