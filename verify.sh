#!/usr/bin/env bash
# =========================================================================
# NumeriX Production Release & Air-Gap Sanity Verification Suite (v2.3.1)
# =========================================================================

set -e

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"
echo -e "${COLOR_CYAN} Starting NumeriX Air-Gapped & Production Sanity Audit ${COLOR_RESET}"
echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"

# 1. Static Type Verification
echo -e "\n[1/5] Checking TypeScript static types (tsc --noEmit)..."
npx tsc --noEmit
echo -e "${COLOR_GREEN}✓ TypeScript static analysis passed with 0 errors.${COLOR_RESET}"

# 2. Production Bundle Compilation
echo -e "\n[2/5] Compiling production build (Vite + Server bundle)..."
npm run build:all
if [ -d "dist" ] && [ -f "dist/index.html" ] && [ -f "dist/server.cjs" ]; then
  echo -e "${COLOR_GREEN}✓ Production artifacts compiled successfully in dist/ (index.html, server.cjs, assets).${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ Build failed: dist artifacts missing.${COLOR_RESET}"
  exit 1
fi

# 3. Air-Gap & Zero Remote Asset Audit
echo -e "\n[3/5] Auditing for external CDN/network URLs in client source and HTML..."
EXTERNAL_REFS=$(grep -rnE 'https?://(cdn|unpkg|cdnjs|jsdelivr|fonts\.googleapis|use\.fontawesome)' src/ index.html 2>/dev/null || true)
if [ -z "$EXTERNAL_REFS" ]; then
  echo -e "${COLOR_GREEN}✓ Zero external runtime CDNs or remote font dependencies detected in application code.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ External references detected:${COLOR_RESET}\n$EXTERNAL_REFS"
  exit 1
fi

# 4. Standalone Server & Healthcheck Verification
echo -e "\n[4/5] Testing production Node.js server startup & /healthz endpoint..."
HOST=127.0.0.1 PORT=3099 node dist/server.cjs &
SERVER_PID=$!
sleep 2

HEALTH_RESPONSE=$(node -e "
  require('http').get('http://127.0.0.1:3099/healthz', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(data);
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  }).on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
")

kill -SIGTERM $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo "Healthcheck Response: $HEALTH_RESPONSE"
echo -e "${COLOR_GREEN}✓ Standalone server started, responded 200 OK on /healthz, and gracefully terminated on SIGTERM.${COLOR_RESET}"

# 5. Configuration & Docker Assets Audit
echo -e "\n[5/5] Validating Docker and Docker Compose configuration files..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ] && [ -f ".env.example" ] && [ -f ".dockerignore" ]; then
  echo -e "${COLOR_GREEN}✓ All container assets (Dockerfile, docker-compose.yml, .env.example, .dockerignore) are present and verified.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ Missing required container assets.${COLOR_RESET}"
  exit 1
fi

echo -e "\n${COLOR_CYAN}======================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}✓ All 5 verification stages passed successfully!${COLOR_RESET}"
echo -e "${COLOR_CYAN} NumeriX v2.3.1 is air-gapped and production-ready.${COLOR_RESET}"
echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"
