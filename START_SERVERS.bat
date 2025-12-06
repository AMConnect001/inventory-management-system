@echo off
echo ========================================
echo Starting Inventory Management System
echo ========================================
echo.

echo [1/2] Starting Laravel Backend Server...
start "Laravel Backend" cmd /k "cd backend && C:\xampp\php\php.exe artisan serve"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js Frontend Server...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

