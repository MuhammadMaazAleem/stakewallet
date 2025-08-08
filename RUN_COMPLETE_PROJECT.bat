@echo off
cls
echo ========================================================
echo          DApp Staking Dashboard - Complete Setup
echo ========================================================
echo.

echo [1/5] Installing Frontend Dependencies...
echo --------------------------------------------------------
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Frontend dependencies failed to install!
    echo.
    echo Try running manually:
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully!
echo.

echo [2/5] Installing Backend Dependencies...
echo --------------------------------------------------------
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Backend dependencies failed to install!
    echo.
    echo Try running manually:
    echo   cd backend
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!
cd ..
echo.

echo [3/5] Starting Backend Server...
echo --------------------------------------------------------
cd backend
start "🔧 Backend API Server (Port 5000)" cmd /k "echo Starting backend server... && npm run dev"
cd ..
echo ✅ Backend server is starting on http://localhost:5000
echo.

echo [4/5] Starting Frontend Server...
echo --------------------------------------------------------
timeout /t 3 /nobreak > nul
start "🚀 Frontend DApp (Port 5173)" cmd /k "echo Starting frontend server... && npm run dev"
echo ✅ Frontend server is starting on http://localhost:5173
echo.

echo [5/5] Opening Browser...
echo --------------------------------------------------------
timeout /t 10 /nobreak > nul
start http://localhost:5173
echo ✅ Browser opening to http://localhost:5173
echo.

echo ========================================================
echo                    🎉 SUCCESS! 🎉
echo ========================================================
echo.
echo Your DApp is now running:
echo.
echo 🔧 Backend API:  http://localhost:5000
echo 🚀 Frontend App: http://localhost:5173
echo.
echo Features Available:
echo ✅ Professional staking dashboard
echo ✅ Three staking pools (ETH, BTC, USDC)
echo ✅ Portfolio management
echo ✅ MetaMask wallet connection
echo ✅ Real-time statistics
echo ✅ Transaction history
echo.
echo Wait 30-60 seconds for servers to fully initialize.
echo The browser will open automatically.
echo.
echo Both server windows will remain open.
echo Close them when you're done testing.
echo.
echo Press any key to close this setup window...
pause > nul
