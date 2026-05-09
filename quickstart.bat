@echo off
REM Payment Gateway - Quick Start Guide (Windows)

echo.
echo 🚀 Payment Gateway - Quick Start
echo ================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Build project
echo 🔨 Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✓ Project built successfully
echo.

REM Start development server
echo 🎯 Starting development server...
call npm run dev
echo.
echo ✅ Application is running!
echo 📱 Open browser: http://localhost:3000
echo.
pause
