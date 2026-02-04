# AcrylicGen Admin Dashboard

This is the Admin Dashboard for AcrylicGen SaaS, built with Next.js 14, React, and Tailwind CSS.

## Getting Started

1.  Navigate to the dashboard directory:
    ```bash
    cd admin-dashboard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Setup

Add these environment variables for the Admin Dashboard:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

On the server (backend):

```
FIREBASE_SERVICE_ACCOUNT_JSON=
FIREBASE_SERVICE_ACCOUNT_BASE64=
FIREBASE_SERVICE_ACCOUNT_PATH=
ADMIN_EMAILS=
```

## Features

-   **Overview**: Real-time stats and revenue charts.
-   **Users**: Manage user accounts, roles, and bans.
-   **Projects**: Monitor file usage and project types.
-   **Subscriptions**: View plan statistics and revenue.
-   **Payments**: Transaction history logs.
-   **Ads**: Ad placement performance and revenue tracking.
-   **Settings**: Configure global app settings like pricing and limits.

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **Language**: TypeScript
