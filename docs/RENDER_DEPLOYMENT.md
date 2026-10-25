# EcoTrack — Complete Render.com Deployment Guide

This guide provides step-by-step instructions for taking **EcoTrack** live on [Render](https://render.com).

Render offers two deployment strategies for EcoTrack:
- **Strategy A (Recommended — Blueprint Infrastructure-as-Code)**: Uses `render.yaml` to spin up both the **Node.js Express API Web Service** and the **React Vite Static Site** with one click.
- **Strategy B (Manual Dashboard Deployment)**: Configure services individually via the Render web dashboard.
- **Strategy C (Single Full-Stack Web Service)**: Run the unified Express server serving both REST API endpoints and the compiled React production bundle under one domain.

---

## Prerequisites

Before deploying to Render, ensure you have:
1. A **GitHub** or **GitLab** account containing the EcoTrack repository.
2. A free **Render** account at [render.com](https://render.com).
3. A free **MongoDB Atlas** cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   - In MongoDB Atlas Network Access, ensure you add IP address `0.0.0.0/0` (Allow access from anywhere) because Render free tier instances use dynamic outbound IPs.
   - Obtain your connection URI in format:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/ecotrack?retryWrites=true&w=majority`

---

## Strategy A: 1-Click Render Blueprint (Recommended)

Render Blueprints parse the [`render.yaml`](../render.yaml) file in the root of the repository and configure all services, routing rules, headers, and build commands automatically.

### Steps:
1. Push your updated code to your GitHub/GitLab repository.
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **"New +"** in the top navigation bar and select **"Blueprint"**.
4. Connect your GitHub/GitLab repository.
5. Render will detect `render.yaml` and display the two configured services:
   - **`ecotrack-api`** (Web Service — Node.js)
   - **`ecotrack-client`** (Static Site — React Vite)
6. Provide the prompted environment variables:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string.
   - `JWT_SECRET`: Leave blank (Render will auto-generate a secure random 256-bit secret) or enter your own secret.
   - `CLIENT_URL`: Enter your expected client URL (e.g. `https://ecotrack-client.onrender.com`).
   - `VITE_API_URL`: Enter your expected backend API URL (e.g. `https://ecotrack-api.onrender.com/api`).
7. Click **"Apply"**. Render will build and deploy both services!

---

## Strategy B: Manual Dashboard Setup

If you prefer to configure the services manually in the Render dashboard:

### 1. Deploy the Backend API (`ecotrack-api`)
1. In the Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `ecotrack-api`
   - **Region**: Select your preferred region (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`).
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
4. Expand **Advanced** $\rightarrow$ **Add Environment Variable**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Port for Express server |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | *(Random 32+ character string)* | Secret for signing JWTs |
   | `JWT_EXPIRES_IN` | `7d` | Token expiration period |
   | `CLIENT_URL` | `https://ecotrack-client.onrender.com` | URL of your deployed frontend |
   | `ADMIN_NAME` | `EcoTrack Administrator` | Default admin display name |
   | `ADMIN_EMAIL` | `admin@ecotrack.org` | Initial admin account email |
   | `ADMIN_PASSWORD` | `AdminSecurePassword123!` | Initial admin account password |
5. Set **Health Check Path** to `/api/health`.
6. Click **Create Web Service**. Wait for the build and deployment logs to say `EcoTrack API running on port 10000`.
7. Note down your backend URL (e.g. `https://ecotrack-api.onrender.com`).

---

### 2. Deploy the Frontend Client (`ecotrack-client`)
1. In the Render Dashboard, click **New +** $\rightarrow$ **Static Site**.
2. Connect your Git repository.
3. Configure the static site settings:
   - **Name**: `ecotrack-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://ecotrack-api.onrender.com/api` | API endpoint with `/api` suffix |
5. Configure SPA Routing Rewrites:
   - Scroll down to the **Redirects/Rewrites** section.
   - Click **Add Rule**.
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - *(Note: This ensures refreshing nested routes like `/reports/new` or `/dashboard` works correctly without 404 errors)*.
6. Click **Create Static Site**. Render will run the Vite build and deploy to its global CDN.

---

## Strategy C: Unified Monorepo Web Service (Single Free Service)

If you wish to use only a single Render service instance:

1. Click **New +** $\rightarrow$ **Web Service**.
2. Settings:
   - **Root Directory**: Leave blank (monorepo root).
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `node server/src/server.js`
3. Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `...`
4. In production mode, Express automatically detects `client/dist` and serves the frontend as static files, routing all client navigations through SPA history fallback.

---

## Database Seeding in Production

To populate your live MongoDB Atlas database with sample waste categories, realistic reports, pickups, and the default admin account:

### Method 1: Using Render Web Shell
1. Go to your backend service `ecotrack-api` in Render.
2. Click **Shell** in the left sidebar to open a terminal session inside your container.
3. Run:
   ```bash
   node src/utils/seedData.js
   ```
4. Output confirms:
   - Admin account created (`admin@ecotrack.org` / `AdminSecurePassword123!`)
   - 4 resident accounts created
   - 12 waste reports seeded with coordinates & status states
   - Pickups and reward point transactions credited

### Method 2: Running Seed Locally Against Atlas
From your local terminal, you can seed Atlas directly:
```bash
MONGODB_URI="your_mongodb_atlas_uri" node server/src/utils/seedData.js
```

---

## Verification & Health Check Checklist

Once deployed, verify the live platform:

| Check | URL / Action | Expected Result |
| :--- | :--- | :--- |
| **API Health Check** | `GET https://ecotrack-api.onrender.com/api/health` | `{"status":"ok","database":"connected",...}` |
| **API Info** | `GET https://ecotrack-api.onrender.com/` | `{"message":"Welcome to EcoTrack API...",...}` |
| **Frontend Landing** | `GET https://ecotrack-client.onrender.com` | Renders EcoTrack hero, stats, and navigation |
| **User Registration** | Navigate to `/register` and create an account | Successful redirect to Resident Dashboard |
| **Waste Reporting** | Submit a waste incident under `/reports/new` | Report appears in list and map view |
| **Admin Portal** | Login with `admin@ecotrack.org` | View system KPIs, triage reports, manage users |
| **SPA Route Refresh** | Press $F5$ on `/reports` or `/dashboard` | Page reloads without 404 error |

---

## Common Issues & Troubleshooting

- **MongoDB connection timed out**:
  Check MongoDB Atlas $\rightarrow$ Network Access. Add `0.0.0.0/0` to allow inbound connections from Render's cloud containers.
- **Frontend requests show CORS error**:
  Ensure the backend's `CLIENT_URL` environment variable matches your frontend URL (e.g. `https://ecotrack-client.onrender.com`).
- **Client displays blank page on nested route refresh**:
  Verify the rewrite rule `/* -> /index.html` is present in Render Static Site redirects and that `base: '/'` is set in `client/vite.config.js`.
- **Render Free Tier Spin-Down (Cold Start)**:
  Free web services spin down after 15 minutes of inactivity. The first request after idle takes ~30-50 seconds to warm up. This is normal behavior on the free tier.
