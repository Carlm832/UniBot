# Deploying UniBot Backend to Fly.io

## Prerequisites
- Fly.io account (https://fly.io)
- `flyctl` CLI installed
- Your Groq API key

## Step-by-Step Deployment

### 1. Install Fly CLI (if not already done)
On Windows:
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Login to Fly.io
```bash
fly auth login
```
This opens a browser to authenticate your account.

### 3. Create a Fly.io App
```bash
cd c:\Users\Carl\Downloads\Documents\UniBotProject\unibot-backend
fly launch
```

When prompted:
- App name: `unibot-backend` (or your preferred name)
- Region: Choose one close to your users (e.g., `sjc` for US West)
- Create a PostgreSQL database? **No** (we use JSON storage)
- Deploy now? **No** (we need to set secrets first)

### 4. Set Environment Variables
```bash
fly secrets set GROQ_API_KEY="your_actual_groq_api_key"
fly secrets set ALLOWED_ORIGIN="https://your-frontend-url.com"
```

Replace:
- `your_actual_groq_api_key` - Get from https://console.groq.com
- `https://your-frontend-url.com` - Your Render frontend URL

### 5. Deploy
```bash
fly deploy
```

### 6. Monitor Deployment
```bash
fly status
fly logs
```

### 7. Test the Backend
Once deployed, you'll get a URL like: `https://unibot-backend.fly.dev`

Test it:
```bash
curl https://unibot-backend.fly.dev/health
```

## Important: Update Frontend URL

Update your React frontend to use the new backend URL:

In `neu-unibot/src/components/ChatInterface.jsx`, change the API URL from:
```javascript
// Old: http://localhost:5000/api/chat/message
// New: https://unibot-backend.fly.dev/api/chat/message
```

Or use an environment variable:
```bash
VITE_API_URL=https://unibot-backend.fly.dev
```

## Auto-Deploy from GitHub (Optional)

To auto-deploy when you push to GitHub:
```bash
fly tokens create deploy
```

Then add to GitHub repository secrets.

## Monitoring & Scaling

View logs:
```bash
fly logs
```

Scale up (add more machines):
```bash
fly scale count 2
```

View resources:
```bash
fly resources
```

## Troubleshooting

**Backend not responding:**
```bash
fly status
fly logs
```

**Need to update code:**
```bash
git push origin main
fly deploy
```

**Clear secrets:**
```bash
fly secrets unset GROQ_API_KEY
```
