@echo off
echo ========================================
echo DApp Staking Dashboard - Complete Setup
echo ========================================
echo.

echo Step 1: Installing Frontend Dependencies...
echo ==========================================
npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend dependencies failed to install!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed successfully!
echo.

echo Step 2: Installing Backend Dependencies...
echo ==========================================
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend dependencies failed to install!
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed successfully!
echo.

echo Step 3: Starting Backend Server...
echo ==================================
start "Backend Server - Port 5000" cmd /k "npm run dev"
cd ..
echo ✓ Backend server starting on http://localhost:5000
echo.

echo Step 4: Starting Frontend Server...
echo ===================================
timeout /t 3 /nobreak > nul
start "Frontend Server - Port 5173" cmd /k "npm run dev"
echo ✓ Frontend server starting on http://localhost:5173
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your DApp is now running:
echo • Backend API: http://localhost:5000
echo • Frontend App: http://localhost:5173
echo.
echo Wait 30-60 seconds for servers to fully start,
echo then open http://localhost:5173 in your browser.
echo.
echo Press any key to close this window...
pause > nul
