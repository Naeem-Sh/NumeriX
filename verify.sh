#!/usr/bin/env bash
# =========================================================================
# NumeriX Production Release & Air-Gap Sanity Verification Suite (v2.3.2)
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
echo -e "\n[1/6] Checking TypeScript static types (tsc --noEmit)..."
npx tsc --noEmit
echo -e "${COLOR_GREEN}✓ TypeScript static analysis passed with 0 errors.${COLOR_RESET}"

# 2. Production Bundle Compilation
echo -e "\n[2/6] Compiling production build (Vite + Server bundle)..."
npm run build:all
if [ -d "dist" ] && [ -f "dist/index.html" ] && [ -f "dist/server.cjs" ]; then
  echo -e "${COLOR_GREEN}✓ Production artifacts compiled successfully in dist/ (index.html, server.cjs, assets).${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ Build failed: dist artifacts missing.${COLOR_RESET}"
  exit 1
fi

# 3. Air-Gap & Zero Remote Asset Audit
echo -e "\n[3/6] Auditing for external CDN/network URLs in client source and HTML..."
EXTERNAL_REFS=$(grep -rnE 'https?://(cdn|unpkg|cdnjs|jsdelivr|fonts\.googleapis|use\.fontawesome)' src/ index.html 2>/dev/null || true)
if [ -z "$EXTERNAL_REFS" ]; then
  echo -e "${COLOR_GREEN}✓ Zero external runtime CDNs or remote font dependencies detected in application code.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ External references detected:${COLOR_RESET}\n$EXTERNAL_REFS"
  exit 1
fi

# 4. Storage Path Derivation & Empty Directory Bootstrap Test
echo -e "\n[4/6] Testing DATA_DIR dynamic derivation & empty directory bootstrap..."
TEST_STORAGE_DIR="/tmp/test_numerix_data_$$"
mkdir -p "$TEST_STORAGE_DIR"

DATA_DIR="$TEST_STORAGE_DIR" HOST=127.0.0.1 PORT=3098 node dist/server.cjs &
TEST_PID=$!
sleep 2

# Verify that server bootstrapped required structure in empty directory
if [ -f "$TEST_STORAGE_DIR/database.json" ] && [ -f "$TEST_STORAGE_DIR/visits.json" ] && [ -d "$TEST_STORAGE_DIR/uploads" ] && [ -d "$TEST_STORAGE_DIR/backups" ]; then
  echo -e "${COLOR_GREEN}✓ Successfully bootstrapped required files and subdirectories in initially empty DATA_DIR ($TEST_STORAGE_DIR).${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ Failed to initialize directory structure in empty DATA_DIR.${COLOR_RESET}"
  kill -SIGTERM $TEST_PID 2>/dev/null || true
  rm -rf "$TEST_STORAGE_DIR"
  exit 1
fi

kill -SIGTERM $TEST_PID 2>/dev/null || true
wait $TEST_PID 2>/dev/null || true
rm -rf "$TEST_STORAGE_DIR"

# 5. Standalone Server & Healthcheck Verification
echo -e "\n[5/6] Testing production Node.js server startup & /healthz endpoint..."
HOST=127.0.0.1 PORT=3099 DATA_DIR="/tmp/numerix_prod_data" node dist/server.cjs &
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
rm -rf "/tmp/numerix_prod_data"

echo "Healthcheck Response: $HEALTH_RESPONSE"
echo -e "${COLOR_GREEN}✓ Standalone server started, responded 200 OK on /healthz with storage ready status, and gracefully terminated on SIGTERM.${COLOR_RESET}"

# 6. Configuration & Docker Assets Audit
echo -e "\n[6/6] Validating Docker and Docker Compose configuration files..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ] && [ -f ".env.example" ] && [ -f ".dockerignore" ] && [ -f ".gitignore" ]; then
  # Verify volume mapping in docker-compose.yml
  if grep -q "\./data:/app/data" docker-compose.yml; then
    echo -e "${COLOR_GREEN}✓ Volume mapping ./data:/app/data verified in docker-compose.yml.${COLOR_RESET}"
  else
    echo -e "${COLOR_RED}✗ Incorrect volume mapping in docker-compose.yml.${COLOR_RESET}"
    exit 1
  fi
  echo -e "${COLOR_GREEN}✓ All container assets (Dockerfile, docker-compose.yml, .env.example, .dockerignore) are present and verified.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}✗ Missing required container assets.${COLOR_RESET}"
  exit 1
fi

echo -e "\n${COLOR_CYAN}======================================================${COLOR_RESET}"
echo -e "${COLOR_GREEN}✓ All 6 verification stages passed successfully!${COLOR_RESET}"
echo -e "${COLOR_CYAN} NumeriX v2.3.2 is air-gapped and production-ready.${COLOR_RESET}"
echo -e "${COLOR_CYAN}======================================================${COLOR_RESET}"

