@echo off
cls
echo ================================================================
echo              MANUAL STEP-BY-STEP INSTRUCTIONS
echo ================================================================
echo.
echo This script will guide you through starting the DApp manually.
echo Follow each step carefully.
echo.
echo ================================================================
echo STEP 1: Install Frontend Dependencies
echo ================================================================
echo.
echo About to run: npm install
echo This will install React, Vite, TypeScript, and other frontend packages.
echo This may take 2-3 minutes...
echo.
pause
echo Running npm install...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ FRONTEND INSTALL FAILED!
    echo.
    echo Please try manually:
    echo 1. Open Command Prompt
    echo 2. cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp
    echo 3. npm install
    echo.
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed!
echo.

echo ================================================================
echo STEP 2: Install Backend Dependencies
echo ================================================================
echo.
echo About to run: cd backend && npm install
echo This will install Express, CORS, and other backend packages.
echo.
pause
cd backend
echo Running npm install in backend folder...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ BACKEND INSTALL FAILED!
    echo.
    echo Please try manually:
    echo 1. Open Command Prompt
    echo 2. cd c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp\backend
    echo 3. npm install
    echo.
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed!
cd ..
echo.

echo ================================================================
echo STEP 3: Start Backend Server
echo ================================================================
echo.
echo About to start the backend server on port 5000
echo This will open a new window - keep it open!
echo.
pause
cd backend
start "Backend Server - Keep This Open!" cmd /k "echo Starting backend... && node simple-server.js"
cd ..
echo ✅ Backend server window opened!
echo.
echo Wait 10 seconds for backend to start...
timeout /t 10 /nobreak

echo ================================================================
echo STEP 4: Test Backend
echo ================================================================
echo.
echo Testing if backend is responding...
echo Opening backend health check in browser...
start http://localhost:5000/api/health
echo.
echo You should see a JSON response with "status": "OK"
echo If you see an error page, the backend isn't working.
echo.
echo Did you see the JSON response? (Y/N)
set /p backend_ok="Enter Y if backend is working, N if not: "
if /i "%backend_ok%" neq "Y" (
    echo.
    echo ❌ Backend not working. Check the backend window for errors.
    echo Common issues:
    echo - Port 5000 already in use
    echo - Node.js not installed
    echo - Dependencies not installed properly
    echo.
    pause
    exit /b 1
)
echo ✅ Backend is working!
echo.

echo ================================================================
echo STEP 5: Start Frontend Server
echo ================================================================
echo.
echo About to start the frontend server on port 5173
echo This will also open a new window - keep it open!
echo.
pause
start "Frontend Server - Keep This Open!" cmd /k "echo Starting frontend... && npm run dev"
echo ✅ Frontend server window opened!
echo.
echo Wait 15 seconds for frontend to start...
timeout /t 15 /nobreak

echo ================================================================
echo STEP 6: Open Your DApp
echo ================================================================
echo.
echo Opening your DApp in the browser...
start http://localhost:5173
echo.
echo ================================================================
echo                        SUCCESS! 🎉
echo ================================================================
echo.
echo Your DApp should now be running:
echo.
echo 🔧 Backend:  http://localhost:5000
echo 🚀 Frontend: http://localhost:5173
echo.
echo Features to test:
echo ✅ Professional staking dashboard
echo ✅ Three staking pools (ETH, BTC, USDC)
echo ✅ MetaMask connection button
echo ✅ Portfolio statistics
echo ✅ Navigation between pages
echo.
echo Keep both server windows open while using the DApp!
echo.
echo ================================================================
echo TROUBLESHOOTING
echo ================================================================
echo.
echo If frontend shows errors:
echo 1. Check the frontend window for error messages
echo 2. Try refreshing the browser (Ctrl+F5)
echo 3. Check browser console (F12)
echo.
echo If backend shows errors:
echo 1. Check the backend window for error messages
echo 2. Make sure port 5000 isn't in use
echo 3. Try restarting the backend window
echo.
echo If MetaMask won't connect:
echo 1. Make sure MetaMask is installed
echo 2. Try switching to localhost network in MetaMask
echo 3. Refresh the page after connecting MetaMask
echo.
echo Press any key to close this setup window...
pause > nul
