@echo off
cls
echo ========================================================
echo          DApp FIXED - Complete Setup
echo ========================================================
echo.

echo [1/6] Clearing Cache and Temp Files...
echo --------------------------------------------------------
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✅ Vite cache cleared
)
if exist dist (
    rmdir /s /q dist
    echo ✅ Build directory cleared
)
echo ✅ Cache cleanup completed
echo.

echo [2/6] Installing Frontend Dependencies...
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

echo [3/6] Installing Backend Dependencies...
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

echo [4/6] Starting Backend Server...
echo --------------------------------------------------------
cd backend
start "🔧 Backend API Server (Port 5000)" cmd /k "echo Starting backend server... && npm run dev"
cd ..
echo ✅ Backend server is starting on http://localhost:5000
echo.

echo [5/6] Starting Frontend Server (Fixed Configuration)...
echo --------------------------------------------------------
timeout /t 5 /nobreak > nul
start "🚀 Frontend DApp (Port 5173)" cmd /k "echo Starting frontend server with proper MIME types... && npm run dev -- --force"
echo ✅ Frontend server is starting on http://localhost:5173
echo.

echo [6/6] Opening Browser...
echo --------------------------------------------------------
echo Waiting for servers to initialize...
timeout /t 15 /nobreak > nul
start http://localhost:5173
echo ✅ Browser opening to http://localhost:5173
echo.

echo ========================================================
echo                    🎉 FIXED VERSION! 🎉
echo ========================================================
echo.
echo Changes Made:
echo ✅ Fixed Vite port configuration (5173)
echo ✅ Added proper MIME type handling
echo ✅ Cleared cache to prevent conflicts
echo ✅ Added force reload flag
echo ✅ Extended startup wait time
echo.
echo Your DApp is now running:
echo 🔧 Backend API:  http://localhost:5000
echo 🚀 Frontend App: http://localhost:5173
echo.
echo If you still see errors:
echo 1. Check both terminal windows for error messages
echo 2. Try refreshing the browser (Ctrl+F5)
echo 3. Open browser developer tools (F12) for details
echo.
echo Press any key to close this setup window...
pause > nul
