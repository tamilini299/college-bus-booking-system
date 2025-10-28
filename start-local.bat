@echo off
echo.
echo ========================================
echo   College Bus Booking System
echo   Starting Local Development Environment
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 7071)...
start "CBBS Backend" cmd /k "cd /d %~dp0simple-backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 5173)...
start "CBBS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:7071
echo Frontend: http://localhost:5173
echo.
echo Login Credentials:
echo   Student - username: student, password: student
echo   Admin   - username: admin, password: admin
echo   Driver  - username: driver, password: driver
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:5173
