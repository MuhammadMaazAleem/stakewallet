@echo off
cls
echo ================================================================
echo                    SYSTEM CHECK
echo ================================================================
echo.
echo Checking if your system is ready to run the DApp...
echo.

echo [1/4] Checking Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to: https://nodejs.org
    echo 2. Download the LTS version
    echo 3. Install and restart your computer
    echo 4. Run this check again
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js is installed
for /f "tokens=*" %%i in ('node --version') do echo    Version: %%i

echo.
echo [2/4] Checking npm...
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is NOT installed!
    echo npm should come with Node.js. Try reinstalling Node.js.
    pause
    exit /b 1
)
echo ✅ npm is installed
for /f "tokens=*" %%i in ('npm --version') do echo    Version: %%i

echo.
echo [3/4] Checking project folder...
if not exist "package.json" (
    echo ❌ Not in the correct folder!
    echo.
    echo Make sure you're running this from:
    echo c:\Users\mr.laptop\OneDrive\Desktop\questions\dapp
    echo.
    echo Current folder: %cd%
    echo.
    pause
    exit /b 1
)
echo ✅ Project folder is correct

echo.
echo [4/4] Checking ports...
netstat -an | findstr ":5000" > nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 is already in use
    echo    You may need to close other applications using this port
) else (
    echo ✅ Port 5000 is available
)

netstat -an | findstr ":5173" > nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5173 is already in use
    echo    You may need to close other applications using this port
) else (
    echo ✅ Port 5173 is available
)

echo.
echo ================================================================
echo                   SYSTEM CHECK COMPLETE! ✅
echo ================================================================
echo.
echo Your system is ready to run the DApp!
echo.
echo Next steps:
echo 1. Run MANUAL_SETUP.bat for guided installation
echo 2. Or try RUN_WORKING_VERSION.bat for automatic setup
echo.
echo Press any key to continue...
pause > nul
