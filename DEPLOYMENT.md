# FinKing AI - Ultra Professional Deployment Guide

## 🚀 Overview
Production-ready AI investment analyst platform with DeepSeek API backend, professional UI, and enterprise-grade security.

---

## 📁 Project Structure
```
finking-ai/
├── app.py              # Flask backend with DeepSeek API
├── index.html          # Professional frontend UI
├── requirements.txt    # Python dependencies
├── Procfile           # Heroku deployment config
├── runtime.txt        # Python version
└── README.md          # This file
```

---

## 🔧 Setup Instructions

### 1. Get DeepSeek API Key
1. Visit https://platform.deepseek.com
2. Sign up/login
3. Navigate to API Keys
4. Create new API key
5. Copy the key (starts with `sk-`)

**IMPORTANT:** Keep your API key secure. Never commit it to Git.

### 2. Local Development

```bash
# Clone or create project directory
mkdir finking-ai
cd finking-ai

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export DEEPSEEK_API_KEY='your-api-key-here'  # Linux/Mac
set DEEPSEEK_API_KEY=your-api-key-here      # Windows

# Run the application
python app.py

# Open browser to http://localhost:5000
```

---

## ☁️ Deployment Options

### Option A: Heroku (Recommended)

**Step 1: Prepare files**
Create `Procfile`:
```
web: gunicorn app:app
```

Create `runtime.txt`:
```
python-3.11.0
```

**Step 2: Deploy**
```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # Mac
# Or download from https://devcenter.heroku.com/articles/heroku-cli

# Login and create app
heroku login
heroku create finking-ai-pro

# Set environment variable
heroku config:set DEEPSEEK_API_KEY='your-api-key-here'

# Deploy
git init
git add .
git commit -m "Initial deployment"
git push heroku main

# Open app
heroku open
```

Your app will be live at: `https://finking-ai-pro.herokuapp.com`

---

### Option B: Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub repo
4. Add environment variable:
   - Key: `DEEPSEEK_API_KEY`
   - Value: Your API key
5. Railway auto-deploys

---

### Option C: Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
5. Add environment variable:
   - Key: `DEEPSEEK_API_KEY`
   - Value: Your API key
6. Deploy

---

### Option D: DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Create App → GitHub
3. Select repo
4. Configure:
   - Type: Web Service
   - Environment Variables: Add `DEEPSEEK_API_KEY`
5. Deploy

---

## 🔐 Environment Variables

**Required:**
- `DEEPSEEK_API_KEY` - Your DeepSeek API key

**Optional:**
- `PORT` - Port number (default: 5000)
- `FLASK_ENV` - Set to `development` for debug mode

---

## 📊 API Endpoints

### POST /api/chat
Send message to FinKing AI

**Request:**
```json
{
  "message": "What's your outlook on AAPL?"
}
```

**Response:**
```json
{
  "reply": "AI response...",
  "timestamp": "2025-11-18T06:00:00Z",
  "model": "deepseek-chat"
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "FinKing AI API",
  "version": "1.0.0",
  "timestamp": "2025-11-18T06:00:00Z"
}
```

---

## 💰 Cost Estimate

**DeepSeek API Pricing:**
- Input: $0.14 per 1M tokens
- Output: $0.28 per 1M tokens

**Usage Examples:**
| Users | Chats/Month | Cost/Month |
|-------|-------------|------------|
| 50    | 2,500       | $0.20      |
| 100   | 5,000       | $0.40      |
| 500   | 25,000      | $2.00      |

**Hosting:**
- Heroku: Free tier (hobby dyno) or $7/month
- Railway: $5/month (includes $5 credit)
- Render: Free tier available

---

## 🛡️ Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Enable HTTPS** - All major hosting providers offer free SSL
3. **Rate limiting** - Add rate limiting middleware for production
4. **Input validation** - Already implemented in backend
5. **Error handling** - Comprehensive error handling included
6. **Logging** - Production logs configured

---

## 🎨 Customization

### Change Branding Colors
Edit `index.html`, find color variables in CSS:
```css
--primary: #60a5fa;
--secondary: #3b82f6;
--background-dark: #0f172a;
```

### Modify System Prompt
Edit `app.py`, update `SYSTEM_PROMPT` variable

### Add Custom Features
- Edit `app.py` for backend logic
- Edit `index.html` for UI changes

---

## 🐛 Troubleshooting

### "API configuration error"
- Ensure `DEEPSEEK_API_KEY` environment variable is set
- Check API key is valid on DeepSeek platform

### "Network error"
- Check internet connection
- Verify DeepSeek API status
- Check firewall/proxy settings

### Slow responses
- DeepSeek API typically responds in 3-10 seconds
- Check your internet speed
- Consider upgrading to paid DeepSeek tier for faster responses

### CORS errors
- `flask-cors` is already configured
- Check browser console for specific errors

---

## 📈 Monitoring

### Check application logs:

**Heroku:**
```bash
heroku logs --tail
```

**Railway:**
View logs in Railway dashboard

**Local:**
Logs print to console

---

## 🔄 Updates

### Update dependencies:
```bash
pip install --upgrade -r requirements.txt
```

### Deploy updates:
```bash
git add .
git commit -m "Update: [description]"
git push heroku main  # or your deployment platform
```

---

## 📞 Support

- **DeepSeek API Docs:** https://api-docs.deepseek.com
- **Flask Documentation:** https://flask.palletsprojects.com
- **Sisko Capital:** sisko@duck.com

---

## ✅ Production Checklist

Before going live:
- [ ] DeepSeek API key configured
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Error handling tested
- [ ] API rate limits understood
- [ ] Logs monitoring set up
- [ ] Backup/disaster recovery plan
- [ ] User documentation ready

---

## 📄 License

MIT License - Free to use for commercial and personal projects

---

## 🎯 Next Steps

1. Deploy to your preferred platform
2. Test with sample queries
3. Customize branding and colors
4. Add custom ad banners
5. Share with users
6. Monitor usage and costs

**Happy investing! 📊🚀**