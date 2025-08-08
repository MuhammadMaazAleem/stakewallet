# Quick Start Guide - Manual Setup

## The Issue
It appears there may be terminal execution issues in VS Code. Here's how to start your DApp manually:

## Method 1: Use the Batch File (Easiest)
1. Open Windows Explorer
2. Navigate to: `c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp`
3. Double-click `start-servers.bat`
4. This will open two command windows - one for backend, one for frontend

## Method 2: Manual Terminal Steps

### Step 1: Start Backend Server
1. Open Command Prompt (cmd)
2. Run these commands:
```cmd
cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp\backend
npm install
npm run dev
```
3. You should see: "Server running on http://localhost:5000"
4. Keep this window open

### Step 2: Start Frontend Server (New Terminal)
1. Open another Command Prompt window
2. Run these commands:
```cmd
cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp
npm install
npm run dev
```
3. You should see: "Local: http://localhost:5173"
4. Keep this window open

### Step 3: Access Your DApp
1. Open your web browser
2. Go to: http://localhost:5173
3. You should see your staking dashboard

## Troubleshooting

### If Backend Fails:
- Make sure MongoDB is installed and running
- Check if port 5000 is available
- Run: `npm install` in the backend folder

### If Frontend Fails:
- Make sure Node.js is installed (version 16+)
- Check if port 5173 is available
- Run: `npm install` in the main dapp folder

### If Browser Shows Empty Page:
- Check browser console for errors (F12)
- Make sure both servers are running
- Try refreshing the page

## What Should You See:
- Backend terminal: "Server running on http://localhost:5000"
- Frontend terminal: "Local: http://localhost:5173"
- Browser: Professional staking dashboard with pools

## Need Help?
If you see any error messages, copy them and let me know what went wrong.
