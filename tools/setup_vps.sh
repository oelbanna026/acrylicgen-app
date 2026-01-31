#!/bin/bash

# Acrylic Generator - One-Click VPS Setup Script
# Run this on your fresh Ubuntu 20.04+ server

echo "🚀 Starting VPS Setup for Acrylic Generator..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
else
    echo "✅ Docker is already installed."
fi

# 3. Setup Firewall (UFW)
echo "🛡️ Configuring Firewall..."
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

echo "🎉 Server setup complete! Please logout and login again to apply Docker permissions."
