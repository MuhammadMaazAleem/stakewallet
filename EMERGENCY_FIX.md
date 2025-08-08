# EMERGENCY FIX - Connection Refused Error

## What Happened:
Your browser shows "localhost refused to connect" because the frontend server (Vite) isn't running on port 5173.

## QUICK FIX - Method 1 (Frontend Only with Mock Data):

1. **Double-click**: `START_FRONTEND_ONLY.bat`
2. **Wait** for it to install dependencies and start
3. **Open browser** to: http://localhost:5173
4. **You'll see** the full UI with sample data

## QUICK FIX - Method 2 (Manual Command):

1. **Open Command Prompt** (cmd)
2. **Copy and paste** these commands one by one:
```cmd
cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp
npm install
npm run dev
```
3. **Wait** for "Local: http://localhost:5173" message
4. **Open browser** to: http://localhost:5173

## What You Should See:
- ✅ Professional staking dashboard
- ✅ Three staking pools (ETH, BTC, USDC)
- ✅ Statistics and charts
- ✅ Wallet connection button
- ✅ Sample staking positions

## If Still Not Working:

### Check 1: Dependencies
```cmd
cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp
dir node_modules
```
If you see "File Not Found", run: `npm install`

### Check 2: Port Conflict
```cmd
netstat -an | findstr ":5173"
```
If port is used, kill the process or restart your computer

### Check 3: Node.js Version
```cmd
node --version
npm --version
```
You need Node.js 16+ and npm 8+

## Backend Setup (Optional - For Full Functionality):
The frontend now works with mock data, but for full features:

1. **Install backend dependencies**:
```cmd
cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp\backend
npm install
```

2. **Start backend**:
```cmd
npm run dev
```

3. **Backend should show**: "Server running on http://localhost:5000"

## Success Indicators:
- ✅ Frontend: "Local: http://localhost:5173" in terminal
- ✅ Backend: "Server running on http://localhost:5000" in terminal  
- ✅ Browser: Professional DApp dashboard loads
- ✅ No console errors (press F12 to check)

The frontend now has mock data so you can see the full UI even without the backend running!
