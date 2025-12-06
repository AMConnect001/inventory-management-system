@echo off
echo ========================================
echo Complete Setup - Inventory Management System
echo ========================================
echo.

cd backend

echo [1/5] Checking Composer dependencies...
if exist "vendor\autoload.php" (
    echo ✓ Dependencies already installed
) else (
    echo Installing Composer dependencies (this may take 2-3 minutes)...
    C:\xampp\php\php.exe composer.phar install --no-interaction
    if errorlevel 1 (
        echo ✗ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
)

echo.
echo [2/5] Generating Laravel application key...
C:\xampp\php\php.exe artisan key:generate --force
if errorlevel 1 (
    echo ✗ Failed to generate key
    pause
    exit /b 1
)
echo ✓ Application key generated

echo.
echo [3/5] Running database migrations...
C:\xampp\php\php.exe artisan migrate --force
if errorlevel 1 (
    echo ⚠ Migration errors (database may not be configured)
    echo Please check your database settings in backend\.env
)
echo ✓ Migrations completed

echo.
echo [4/5] Seeding database with default users...
C:\xampp\php\php.exe artisan db:seed --force
if errorlevel 1 (
    echo ⚠ Seeding errors
)
echo ✓ Database seeded

echo.
echo [5/5] Starting servers...
echo.
echo Starting Laravel Backend Server...
start "Laravel Backend - Port 8000" cmd /k "cd backend && C:\xampp\php\php.exe artisan serve"
timeout /t 3 /nobreak >nul

cd ..
echo Starting Next.js Frontend Server...
start "Next.js Frontend - Port 3000" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:3000
echo.
echo Default Login Credentials:
echo   Email: admin@inventory.com
echo   Password: admin123
echo.
echo Press any key to exit...
pause >nul

