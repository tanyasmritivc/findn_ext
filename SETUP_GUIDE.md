# Findn AI - Complete Setup Guide

This guide will help you set up both the **backend server** and **browser extension** for Findn AI.

## 🏗️ **Architecture Overview**

- **Backend Server**: Node.js/Express server that securely handles OpenAI API calls
- **Browser Extension**: Chrome extension that scrapes profiles and displays AI insights
- **Security**: OpenAI API key is stored only on the backend server, never exposed to the browser

## 📋 **Prerequisites**

- Node.js (v14 or higher)
- Chrome or Edge browser
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 **Step 1: Set Up the Backend Server**

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=3000
```

### 1.4 Start the Backend Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
🚀 Findn AI Backend running on port 3000
📊 Health check: http://localhost:3000/health
🔍 Analysis endpoint: http://localhost:3000/analyze
✅ OpenAI API key loaded successfully
```

### 1.5 Test the Backend
Open a new terminal and test:
```bash
curl http://localhost:3000/health
```

You should get:
```json
{
  "success": true,
  "message": "Findn AI Backend is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔌 **Step 2: Install the Browser Extension**

### 2.1 Open Chrome Extensions
- Open Chrome or Edge
- Go to `chrome://extensions/` (or `edge://extensions/`)
- Enable "Developer mode" (toggle in top right)

### 2.2 Load the Extension
- Click "Load unpacked"
- Navigate to and select the `findnext` folder (the main project folder, not the backend subfolder)
- The extension should appear in your extensions list

### 2.3 Verify Installation
- Look for the Findn AI extension icon in your browser toolbar
- Click it to open the popup
- You should see the main interface

## ⚙️ **Step 3: Configure the Extension**

### 3.1 Check Backend Connection
- Click the Findn AI extension icon
- Click the settings gear ⚙️ in the top right
- Check the "Backend Status" - it should show:
  - 🟢 "Backend connected" if the server is running
  - 🔴 "Backend offline - Start the server" if it's not running

### 3.2 Platform Settings
- Ensure LinkedIn and Instagram toggles are enabled
- Click "Save Settings"

## 🧪 **Step 4: Test the Complete System**

### 4.1 Test on LinkedIn
1. Go to any LinkedIn profile (e.g., `https://www.linkedin.com/in/satyanadella/`)
2. Click the Findn AI extension icon
3. Click "🔍 Analyze Profile"
4. Wait 10-30 seconds for AI analysis
5. You should see three cards with networking insights

### 4.2 Test on Instagram
1. Go to any Instagram profile (e.g., `https://www.instagram.com/microsoft/`)
2. Click the Findn AI extension icon
3. Click "🔍 Analyze Profile"
4. Wait for AI analysis results

## 🔧 **Troubleshooting**

### Backend Issues

**"Server misconfigured: API key missing"**
- Check that `.env` file exists in the `backend` folder
- Verify `OPENAI_API_KEY` is set correctly in `.env`
- Restart the backend server

**"Cannot connect to Findn AI backend"**
- Make sure the backend server is running (`npm run dev`)
- Check that it's running on `http://localhost:3000`
- Test the health endpoint: `curl http://localhost:3000/health`

### Extension Issues

**"Failed to scrape profile data"**
- Make sure you're on an actual profile page, not a feed or search page
- Try refreshing the page and analyzing again
- Some profiles may have privacy settings that limit data access

**Backend Status shows "🔴 Backend offline"**
- Start the backend server: `cd backend && npm run dev`
- Make sure it's running on port 3000
- Check for firewall or antivirus blocking localhost connections

### API Issues

**"Invalid API key configuration"**
- Verify your OpenAI API key is correct
- Check that your OpenAI account has sufficient credits
- Test the API key directly with OpenAI's documentation

**"API rate limit exceeded"**
- Wait a few minutes before trying again
- Consider upgrading your OpenAI plan for higher rate limits

## 📁 **Project Structure**

```
findnext/
├── backend/                 # Backend server
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env               # Environment variables (create this)
│   └── .env.example       # Environment template
├── manifest.json          # Extension configuration
├── background.js          # Extension backend communication
├── content.js            # Profile scraping
├── popup.html            # Extension UI
├── popup.js              # Extension logic
├── style.css             # Extension styling
└── README.md             # Documentation
```

## 🔒 **Security Notes**

- ✅ OpenAI API key is stored only on your local backend server
- ✅ No sensitive data is sent to external servers (except OpenAI for analysis)
- ✅ Profile data is processed locally and not stored permanently
- ✅ All communication between extension and backend is local (localhost)

## 🚀 **Production Deployment** (Optional)

If you want to deploy the backend to a cloud service:

1. **Deploy Backend**: Use services like Heroku, Railway, or Vercel
2. **Update Extension**: Change the `backendUrl` in `background.js` to your deployed URL
3. **Environment Variables**: Set `OPENAI_API_KEY` in your cloud service's environment settings
4. **HTTPS**: Ensure your deployed backend uses HTTPS
5. **CORS**: Update CORS settings in `server.js` if needed

## 📞 **Support**

If you encounter issues:
1. Check the browser console for error messages (`F12` → Console tab)
2. Check the backend server logs in your terminal
3. Verify all steps in this guide were followed correctly
4. Test with different LinkedIn/Instagram profiles

## 🎉 **You're Ready!**

Your Findn AI extension is now fully set up and ready to provide AI-powered networking insights. Visit any LinkedIn or Instagram profile and start discovering valuable connections, conversation starters, and growth opportunities!
