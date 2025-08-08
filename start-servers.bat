@echo off
echo ====================================
echo DApp Staking Dashboard - Quick Start
echo ====================================
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Dependencies not found! Running full setup...
    call SETUP_AND_RUN.bat
    exit /b
)

if not exist "backend\node_modules" (
    echo Backend dependencies not found! Running full setup...
    call SETUP_AND_RUN.bat
    exit /b
)

echo ✓ Dependencies found. Starting servers...
echo.

echo Starting Backend Server (Port 5000)...
cd backend
start "Backend Server - DApp API" cmd /k "npm run dev"
cd ..

echo Starting Frontend Server (Port 5173)...
timeout /t 2 /nobreak > nul
start "Frontend Server - DApp UI" cmd /k "npm run dev"

echo.
echo ====================================
echo Servers Starting!
echo ====================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Wait 30 seconds, then open:
echo http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul
