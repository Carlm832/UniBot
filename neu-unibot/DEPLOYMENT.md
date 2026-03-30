# Deploying UniBot Frontend to Netlify

## Quick Start (2 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Update frontend deployment configuration"
git push origin main
```

### Step 2: Deploy on Netlify
1. Go to https://netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**, select your **Carlm832/UniBot** repository
4. **Build settings:**
   - Base directory: `neu-unibot`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Set **Environment Variables:**
   - Key: `VITE_API_URL`
   - Value: `https://unibot-backend.fly.dev/api/chat` (once your backend is deployed)
6. Click **Deploy**

That's it! Netlify will auto-deploy whenever you push to main.

## During Development

For local development with the backend:
```bash
cd neu-unibot
cp .env.example .env.local
# Edit .env.local and set VITE_API_URL=http://localhost:5000/api/chat
npm run dev
```

## After Backend is Live on Fly.io

Once your Fly.io backend is deployed (you'll get a URL like `https://unibot-backend.fly.dev`):

1. Go to your Netlify site settings
2. Find **Build & Deploy** → **Environment**
3. Update `VITE_API_URL` to: `https://unibot-backend.fly.dev/api/chat`
4. Redeploy (Netlify will auto-rebuild)

## Fix CORS Issues

If you get CORS errors, update your backend's `fly.toml`:

```toml
[env]
  ALLOWED_ORIGIN = "https://your-netlify-url.netlify.app"
```

Then redeploy the backend:
```bash
fly deploy
```

## Custom Domain (Optional)

Add your own domain in Netlify settings for free!

## Auto-Deploy from GitHub

Already configured! Every push to `main` triggers a new deployment.
