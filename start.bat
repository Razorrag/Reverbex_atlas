@echo off
REM Geospatial Image Alignment Application Startup Script for Windows

echo Starting Geospatial Image Alignment Application...
echo ==============================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js v18+ and try again.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    where python3 >nul 2>nul
    if %errorlevel% neq 0 (
        echo Error: Python is not installed. Please install Python 3.9+ and try again.
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)

REM Install dependencies if needed
echo Installing dependencies...
call npm install

cd api
call npm install
cd ..

cd worker
%PYTHON_CMD% -m pip install -r requirements.txt
cd ..

REM Create data directories if they don't exist
if not exist "data\uploads" mkdir data\uploads
if not exist "data\outputs" mkdir data\outputs
if not exist "data\sample-data" mkdir data\sample-data

REM Generate sample data if it doesn't exist
if not exist "data\sample-data\sample_image_a.tif" (
    echo Generating sample data...
    cd scripts
    %PYTHON_CMD% generate-sample-data.py
    cd ..
)

REM Start the API server in a new window
echo Starting API server...
start "API Server" cmd /k "cd api && npm run dev"

REM Wait a moment for the API server to start
timeout /t 3 /nobreak >nul

REM Start the frontend server in a new window
echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Application is starting up!
echo API Server: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Close this window to keep servers running, or press any key to stop them.
pause >nul

REM Stop servers by closing the windows
taskkill /FI "WINDOWTITLE eq API Server*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Frontend Server*" /F >nul
echo Servers stopped.