@echo off
echo =============================================
echo DApp Frontend ONLY - Emergency Start
echo =============================================
echo.
echo This will start just the frontend with mock data
echo so you can see the UI while we debug the backend.
echo.

echo Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Try running this manually:
    echo   npm install
    pause
    exit /b 1
)

echo.
echo Starting frontend with mock data...
echo Opening on: http://localhost:5173
echo.
npm run dev

pause
