# 🚀 Deployment Guide - Code Review Assistant

Complete guide to deploy your Online Judge platform to the cloud.

---

## 🌐 Option 1: Deploy to Render (Recommended - FREE)

Render offers a free tier perfect for this project!

### Prerequisites
- GitHub account (you have this ✅)
- MongoDB Atlas account (we'll set this up)

---

### Step 1: Set Up MongoDB Atlas (Free Database)

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** for a free account
3. **Create a cluster:**
   - Choose **FREE tier** (M0)
   - Select a region close to you
   - Click **"Create Cluster"**
4. **Create database user:**
   - Go to **Database Access** → **Add New Database User**
   - Username: `admin`
   - Password: Generate a strong password (save it!)
   - User Privileges: **Read and write to any database**
5. **Whitelist IP addresses:**
   - Go to **Network Access** → **Add IP Address**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Confirm
6. **Get connection string:**
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/online-judge?retryWrites=true&w=majority`

---

### Step 2: Deploy to Render

1. **Go to:** https://render.com/
2. **Sign up** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository:**
   - Click **"Connect account"** if needed
   - Find and select: **Shrey-003/Code-review-assistant**
5. **Configure the service:**
   - **Name:** `code-review-assistant`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** **Free**
6. **Add Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Generate random string (see below) |
   | `FRONTEND_URL` | `https://code-review-assistant.onrender.com` |
   | `PORT` | `5000` |

   **Generate JWT_SECRET:**
   - Use this online tool: https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new
   - Or run in PowerShell:
     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
     ```

7. **Click "Create Web Service"**

8. **Wait for deployment** (5-10 minutes)
   - You'll see build logs
   - Once it says "Live", your app is deployed! 🎉

9. **Your API will be live at:**
   ```
   https://code-review-assistant.onrender.com
   ```

---

### Step 3: Seed Initial Data

After deployment, you need to seed the code templates:

**Option A: Use Render Shell**
1. Go to your service dashboard
2. Click **"Shell"** tab
3. Run: `node seedTemplates.js`

**Option B: Create a seed endpoint (easier)**
Add this to your app.js temporarily:
```javascript
app.get('/api/seed', async (req, res) => {
  const CodeTemplate = require('./models/CodeTemplate');
  // ... paste seed data from seedTemplates.js
  res.json({ message: 'Seeded!' });
});
```
Then visit: `https://code-review-assistant.onrender.com/api/seed`

---

### Step 4: Test Your Deployment

```bash
# Test if API is live
curl https://code-review-assistant.onrender.com/api/problems

# Test templates
curl https://code-review-assistant.onrender.com/api/templates

# Test signup
curl -X POST https://code-review-assistant.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🌐 Option 2: Deploy to Railway (Alternative - FREE)

Railway is another excellent free option.

### Steps:

1. **Go to:** https://railway.app/
2. **Sign in with GitHub**
3. **Click "New Project"** → **"Deploy from GitHub repo"**
4. **Select:** `Shrey-003/Code-review-assistant`
5. **Add variables:**
   - Click **"Variables"** tab
   - Add same environment variables as Render
6. **Deploy automatically starts!**

Your app will be at: `https://code-review-assistant.up.railway.app`

---

## 🌐 Option 3: Deploy to Vercel (Backend API)

Vercel is great for serverless deployments.

### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd C:\Users\Admin\.gemini\antigravity\scratch\Dev-Project
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: code-review-assistant
   - Directory: ./
   - Override settings: No

5. **Add environment variables:**
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```

---

## 📊 After Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Environment variables are set correctly
- [ ] Code templates are seeded
- [ ] API endpoints respond correctly
- [ ] Can create user account
- [ ] Can list problems
- [ ] Can get templates

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify connection string is correct
- Ensure password doesn't have special characters (or URL encode them)

### Issue: "Application failed to start"
**Solution:**
- Check build logs for errors
- Verify all environment variables are set
- Ensure `npm start` works locally first

### Issue: "JWT errors"
**Solution:**
- Make sure JWT_SECRET is set in environment variables
- Secret should be at least 32 characters

---

## 🎯 Recommended: Render

**Why Render?**
- ✅ Free tier with 750 hours/month
- ✅ Auto-deploys from GitHub
- ✅ Easy environment variable management
- ✅ Built-in HTTPS
- ✅ Good for Node.js apps

**Note:** Free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🚀 Next Steps After Deployment

1. **Update README** with your live API URL
2. **Test all endpoints** using the deployed URL
3. **Build a frontend** that connects to your API
4. **Share your project** on LinkedIn/GitHub
5. **Add custom domain** (optional, available on paid plans)

---

## 📝 Example .env for Production

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/online-judge?retryWrites=true&w=majority
JWT_SECRET=your-32-character-random-string-here
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000
```

---

**Ready to deploy? Start with Render - it's the easiest!** 🚀

Need help? Check the [Render Docs](https://render.com/docs) or ask me!
