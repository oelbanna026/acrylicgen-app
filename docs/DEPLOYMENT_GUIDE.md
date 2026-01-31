# Global Deployment Guide 🌍

This guide explains how to deploy "Acrylic Generator" to a global domain (e.g., `your-app.com`) and set up a safe update workflow (Staging -> Production).

## 1. Server Prerequisites

To host this application online, you need a Virtual Private Server (VPS).

### 🔷 How to Buy a VPS on DigitalOcean (Recommended)
Since you are already on the dashboard:
1.  **Finish Account Setup**: Click "Add Payment Method" and add a card or PayPal (this is required to activate the account).
2.  **Create a Droplet**:
    *   Click the big green **Create** button -> Select **Droplets**.
    *   **Region**: Choose the data center closest to your customers (e.g., London, Frankfurt, New York).
    *   **Image**: Choose **Ubuntu 22.04 (LTS)** or **24.04 (LTS)**.
    *   **Size**: Select **Basic** -> **Regular** -> **$6/month** (or the cheapest option available).
    *   **Authentication**: Select **Password** and create a strong password (save this!).
    *   **Hostname**: Give it a name like `acrylic-server`.
    *   Click **Create Droplet**.
3.  **Get Your IP**:
    *   Wait a minute for the progress bar to finish.
    *   Copy the **IP Address** shown next to your new Droplet (e.g., `164.92.123.45`).

**Requirements:**
- Ubuntu 20.04 or later
- Docker & Docker Compose installed
- A Domain Name (purchased from GoDaddy, Namecheap, etc.)

## 2. Initial Server Setup

1. **Buy your domain** (e.g., `acrylic-design.com`).
2. **Point DNS Records** to your VPS IP address:
   
   **For Namecheap Users:**
   - Log in to Namecheap -> Domain List -> Manage.
   - Go to **Advanced DNS**.
   - Click **Add New Record**:
     - Type: `A Record`
     - Host: `@`
     - Value: `YOUR_VPS_IP_ADDRESS` (e.g., 164.92.xxx.xxx)
     - TTL: Automatic
   - Add another record:
     - Type: `A Record`
     - Host: `www`
     - Value: `YOUR_VPS_IP_ADDRESS`
   
   *(Wait 5-30 minutes for DNS to propagate)*

3. **Install Docker on VPS:**
   ```bash
   # Connect to your server
   ssh root@your-server-ip
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

## 3. Deploying the Application

We use `docker-compose` for a one-command deployment.

1. **Clone your repository on the server:**
   ```bash
   git clone https://github.com/your-username/acrylic-generator.git
   cd acrylic-generator
   ```

2. **Start the application:**
   ```bash
   docker compose up -d --build
   ```

The app will now be available at `http://YOUR_SERVER_IP`.

## 4. Setting Up the Domain (Production)

To make it accessible via your domain securely (HTTPS), we recommend using a reverse proxy like **Caddy** or extending the Nginx config with Certbot.

**Easy Method (Caddy):**
Add a `Caddyfile` to your project:
```
your-domain.com {
    reverse_proxy localhost:80
}
```
Run Caddy alongside your docker containers.

## 5. Safe Update Workflow (Staging vs Production)

To prevent breaking the live site, follow this workflow:

### A. The Concept
- **Production (`main` branch)**: The live site that users see.
- **Staging (`dev` or `staging` branch)**: A private version for you to test changes.

### B. Workflow Steps
1. **Develop Locally**: Make changes on your computer.
2. **Push to Staging**:
   ```bash
   git checkout -b feature/new-design
   git commit -m "New design"
   git push origin feature/new-design
   ```
3. **Review (Pull Request)**:
   - Go to GitHub/GitLab.
   - Open a "Pull Request" from your feature branch to `main`.
   - **Do not merge yet!**
   - If you have a Staging server setup, deploy this branch there first to test.
   
4. **Deploy to Production**:
   - Once verified, merge the Pull Request to `main`.
   - On your server, run:
     ```bash
     git pull origin main
     docker compose up -d --build
     ```

## 6. GitHub Actions (Automated Deployment)

The file `.github/workflows/deploy.yml` is prepared to automate this.
- When you push to `main`, it can automatically trigger the update on your server (requires configuring SSH secrets in GitHub).

## 7. Important Notes
- **Database**: The current setup uses SQLite (`database.sqlite`).
  - **Backup**: Regularly download/backup `server/database.sqlite`.
  - **Persistence**: The Docker setup ensures the database is saved in a volume so it isn't lost during updates.
- **Environment Variables**:
  - On the server, create a `.env` file with a strong `JWT_SECRET`.

---
**Ready to go global! 🚀**
