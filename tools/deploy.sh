#!/bin/bash

# Acrylic Generator - Quick Deploy Script
# Run this to update the app from GitHub

echo "🔄 Checking for updates..."

# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart containers
echo "🚀 Rebuilding and restarting containers..."
docker compose up -d --build

# 3. Cleanup unused images
docker image prune -f

echo "✅ Deployment complete! System is running."
