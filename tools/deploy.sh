#!/bin/bash

# Acrylic Generator - Quick Deploy Script
# Run this to update the app from GitHub

echo "🔄 Checking for updates..."

# 1. Pull latest code
git pull origin main

echo "🧩 Building admin dashboard..."
cd admin-dashboard
npm install
npm run build
rm -rf ../dist/admin
mkdir -p ../dist/admin
cp -r out/* ../dist/admin/
cd ..

echo "🚀 Rebuilding and restarting containers..."
docker compose up -d --build

docker image prune -f

echo "✅ Deployment complete! System is running."
