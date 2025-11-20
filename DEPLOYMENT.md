# Render Deployment Guide - ReverbEx Atlas

## Overview

We'll deploy ReverbEx Atlas to Render with:
- **Backend + Worker**: Single Node.js service (includes Python)
- **Frontend**: Static site (Vite build)

## Prerequisites

1. Render account: https://render.com (free tier available)
2. GitHub repo connected
3. Code pushed to GitHub

---

## Part 1: Deploy Backend (Node.js + Python)

### Step 1: Create `render.yaml` (Infrastructure as Code)

This file automates the deployment:

```yaml
services:
  # Backend API + Python Worker
  - type: web
    name: reverbex-atlas-api
    env: node
    region: oregon
    plan: free
    buildCommand: |
      cd api && npm install
      cd ../worker && pip install -r requirements.txt
    startCommand: node api/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8080
      - key: PYTHON_PATH
        value: python3
    healthCheckPath: /api/jobs

  # Frontend Static Site
  - type: web
    name: reverbex-atlas-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://reverbex-atlas-api.onrender.com
```

### Step 2: Create Build Script

Create `render-build.sh`:

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

# Install API dependencies
cd api
npm install
cd ..

# Install Worker dependencies
cd worker
pip install -r requirements.txt
cd ..

echo "✅ Build complete!"
```

Make it executable:
```bash
chmod +x render-build.sh
```

---

## Part 2: Manual Deployment (Without render.yaml)

### Option A: Backend Deployment

1. **Go to Render Dashboard**
2. **Click "New +"** → **Web Service**
3. **Connect your GitHub repository**
4. **Configure:**

```
Name: reverbex-atlas-api
Environment: Node
Region: Oregon (or closest)
Branch: main
Root Directory: (leave empty)

Build Command:
cd api && npm install && cd ../worker && pip install -r requirements.txt

Start Command:
node api/server.js

Plan: Free
```

5. **Add Environment Variables:**
```
NODE_ENV = production
PORT = 8080
PYTHON_PATH = python3
```

6. **Click "Create Web Service"**

### Option B: Frontend Deployment

1. **Click "New +"** → **Static Site**
2. **Connect same GitHub repo**
3. **Configure:**

```
Name: reverbex-atlas
Branch: main
Root Directory: (leave empty)

Build Command:
npm install && npm run build

Publish Directory:
dist

Plan: Free
```

4. **Add Environment Variable:**
```
VITE_API_URL = https://reverbex-atlas-api.onrender.com
```

5. **Click "Create Static Site"**

---

## Part 3: Update Code for Production

### 1. Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  base: '/',
});
```

### 2. Update `package.json` - Add Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node api/server.js"
  }
}
```

### 3. Create `.env.production`

```env
VITE_API_URL=https://reverbex-atlas-api.onrender.com
```

### 4. Update CORS in `api/server.js`

```javascript
// Update CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://reverbex-atlas.onrender.com', // Your frontend URL
  'https://reverbex-atlas-api.onrender.com' // Your backend URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
```

---

## Part 4: Data Persistence on Render

**Important:** Render's free tier has ephemeral filesystem!

### Solution: Use External Storage

#### Option 1: Render Disks (Paid)
- Add persistent disk for `data/` directory
- $1-2/month for 1GB

#### Option 2: Cloud Storage (Free Tier)
- Use AWS S3, Cloudflare R2, or Google Cloud Storage
- Update code to save to cloud instead of local disk

#### Quick Fix for Demo:
```javascript
// In api/server.js
const JOBS_FILE = process.env.JOBS_FILE_PATH || 
  path.join(__dirname, '../data/jobs.json');

// For Render, can use /opt/render/project/src/data
```

---

## Part 5: Environment Variables Summary

### Backend Service:
```
NODE_ENV=production
PORT=8080
PYTHON_PATH=python3
JOBS_FILE_PATH=/opt/render/project/src/data/jobs.json
```

### Frontend Service:
```
VITE_API_URL=https://reverbex-atlas-api.onrender.com
```

---

## Part 6: Post-Deployment

### 1. Test Your Deployment

```bash
# Test API
curl https://reverbex-atlas-api.onrender.com/api/jobs

# Test Frontend
# Open in browser:
https://reverbex-atlas.onrender.com
```

### 2. Update README.md

```markdown
## 🌐 Live Demo

**Frontend**: https://reverbex-atlas.onrender.com
**API**: https://reverbex-atlas-api.onrender.com

⚠️ Note: Free tier sleeps after 15min inactivity. First load may take 30-60 seconds.
```

### 3. Update LinkedIn Post

Replace `[YOUR_RENDER_URL_HERE]` with:
```
https://reverbex-atlas.onrender.com
```

---

## Troubleshooting

### Issue: Build Fails - Python Dependencies

**Solution:** Add `requirements.txt` to root:
```
rasterio>=1.3.0
numpy>=1.24.0
scikit-image>=0.21.0
shapely>=2.0.0
```

### Issue: App Sleeps on Free Tier

**Solution:** Add note in your LinkedIn post:
> "⏳ First load may take 30-60s (free tier spins down after inactivity)"

### Issue: File Uploads Don't Work

**Solution:** Render's filesystem is ephemeral. For production:
1. Use Render Disk (paid)
2. Or migrate to cloud storage (S3/R2)

---

## Quick Start Commands

```bash
# 1. Create necessary files
touch render.yaml
touch .env.production

# 2. Update CORS in api/server.js

# 3. Commit and push
git add .
git commit -m "feat: add Render deployment configuration"
git push origin main

# 4. Deploy on Render
# - Go to https://render.com/dashboard
# - Click "New +" → "Blueprint"
# - Connect repo
# - Deploy!
```

---

## Estimated Costs

**Free Tier:**
- Frontend: ✅ Free forever
- Backend: ✅ 750 hours/month free
- Limitation: Sleeps after 15min, ephemeral storage

**Paid Upgrade ($7/month):**
- Always-on backend
- Add persistent disk ($1/GB)
- Custom domain support

---

**Your URLs will be:**
- Frontend: `https://reverbex-atlas.onrender.com`
- Backend: `https://reverbex-atlas-api.onrender.com`

Good luck with your launch! 🚀
