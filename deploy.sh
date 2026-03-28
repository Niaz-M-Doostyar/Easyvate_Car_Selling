#!/bin/bash
# =============================================================
# deploy.sh  –  Push to GitHub and deploy to VPS
# Usage:  bash deploy.sh "Your commit message"
# =============================================================

set -e   # exit immediately on any error

# ── CONFIG ────────────────────────────────────────────────────
VPS_IP="194.163.170.240"
VPS_USER="root"
VPS_DIR="/root/Easyvate_Car_Selling"
GITHUB_REPO="https://github.com/Niaz-M-Doostyar/Easyvate_Car_Selling.git"
COMMIT_MSG="${1:-Deploy latest changes}"
# ─────────────────────────────────────────────────────────────

echo ""
echo "============================================="
echo " Easyvate Car Selling – Deployment Script"
echo "============================================="
echo ""

# ── STEP 1: Push to GitHub ────────────────────────────────────
echo "[1/4] Pushing code to GitHub..."
cd "$(dirname "$0")"

git add -A
git commit -m "$COMMIT_MSG" || echo "  (nothing new to commit, continuing...)"
git push origin main
echo "  ✓ Code pushed to GitHub"
echo ""

# ── STEP 2: SSH into VPS and deploy ──────────────────────────
echo "[2/4] Connecting to VPS $VPS_IP and deploying..."

ssh ${VPS_USER}@${VPS_IP} bash << ENDSSH

set -e

echo ""
echo "--- [VPS] Removing old application ---"
pkill -f 'node app.js'  || true
pkill -f 'next start'   || true
pkill -f 'next dev'     || true
rm -rf ${VPS_DIR}

echo "--- [VPS] Cloning fresh from GitHub ---"
git clone ${GITHUB_REPO} ${VPS_DIR}
cd ${VPS_DIR}

echo ""
echo "--- [VPS] Writing backend .env (vps mode) ---"
cat > backend/.env << 'EOF'
# ============================================================
# SINGLE SWITCH: vps = runs on VPS, local = runs on your Mac
# ============================================================
DEPLOY_TARGET=vps

# JWT
JWT_SECRET=easyvate-super-secret-key-2024
JWT_EXPIRES_IN=24h
EOF

echo "--- [VPS] Writing frontend .env.local (vps mode) ---"
cat > frontend-nextjs/.env.local << 'EOF'
# ============================================================
# SINGLE SWITCH: vps = uses VPS API, local = uses localhost
# ============================================================
NEXT_PUBLIC_DEPLOY_TARGET=vps
EOF

echo ""
echo "--- [VPS] Installing backend dependencies ---"
cd ${VPS_DIR}/backend
rm -rf node_modules package-lock.json
npm install

echo "--- [VPS] Starting backend ---"
npm run start > /tmp/backend.log 2>&1 &
echo "  Backend PID: $!"
sleep 3
curl -sf http://localhost:3001/health && echo "  ✓ Backend healthy" || echo "  ✗ Backend not responding (check /tmp/backend.log)"

echo ""
echo "--- [VPS] Installing frontend dependencies ---"
cd ${VPS_DIR}/frontend-nextjs
rm -rf node_modules package-lock.json .next
npm install

echo "--- [VPS] Building frontend ---"
npm run build

echo "--- [VPS] Starting frontend ---"
npm run start > /tmp/frontend.log 2>&1 &
echo "  Frontend PID: $!"
sleep 3
curl -sf http://localhost:3000 > /dev/null && echo "  ✓ Frontend healthy" || echo "  ✗ Frontend not responding (check /tmp/frontend.log)"

echo ""
echo "============================================="
echo " Deployment complete!"
echo " Backend  : http://${VPS_IP}:3001"
echo " Frontend : http://${VPS_IP}:3000"
echo " Login    : admin / admin123"
echo "============================================="

ENDSSH

echo ""
echo "[3/4] Deployment finished successfully!"
echo ""
echo "============================================="
echo " App is now running on your VPS"
echo " Frontend : http://${VPS_IP}:3000"
echo " Backend  : http://${VPS_IP}:3001/health"
echo "============================================="
