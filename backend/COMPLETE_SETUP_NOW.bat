@echo off
title Laravel Backend Complete Setup
color 0A
echo.
echo ========================================
echo   LARAVEL BACKEND COMPLETE SETUP
echo ========================================
echo.
echo This will install everything automatically.
echo Please be patient - Step 1 takes 5-10 minutes.
echo.
pause

echo.
echo ========================================
echo STEP 1: Installing Dependencies
echo ========================================
echo This will take 5-10 minutes. Please wait...
echo.
C:\xampp\php\php.exe composer.phar install --no-interaction --prefer-dist
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Please check your internet connection
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed successfully!
echo.
pause

echo.
echo ========================================
echo STEP 2: Creating .env File
echo ========================================
if not exist .env (
    (
        echo APP_NAME="Inventory Management System"
        echo APP_ENV=local
        echo APP_KEY=
        echo APP_DEBUG=true
        echo APP_TIMEZONE=UTC
        echo APP_URL=http://localhost:8000
        echo.
        echo DB_CONNECTION=mysql
        echo DB_HOST=127.0.0.1
        echo DB_PORT=3306
        echo DB_DATABASE=inventory_db
        echo DB_USERNAME=root
        echo DB_PASSWORD=
        echo.
        echo LOG_CHANNEL=stack
        echo CACHE_DRIVER=file
        echo SESSION_DRIVER=file
    ) > .env
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)
echo.

echo ========================================
echo STEP 3: Generating Application Key
echo ========================================
C:\xampp\php\php.exe artisan key:generate --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate key
    pause
    exit /b 1
)
echo [OK] Application key generated
echo.

echo ========================================
echo STEP 4: Database Setup Required
echo ========================================
echo.
echo IMPORTANT: Before continuing, make sure:
echo   1. MySQL is running (check XAMPP Control Panel)
echo   2. Database 'inventory_db' exists
echo      (Create it in phpMyAdmin or run:)
echo      C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS inventory_db;"
echo   3. Edit .env file if MySQL has a password
echo.
pause

echo.
echo ========================================
echo STEP 5: Running Migrations
echo ========================================
C:\xampp\php\php.exe artisan migrate --force
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to run migrations
    echo.
    echo Please check:
    echo   - MySQL is running
    echo   - Database 'inventory_db' exists
    echo   - Database credentials in .env are correct
    echo.
    pause
    exit /b 1
)
echo [OK] Migrations completed successfully!
echo.

echo ========================================
echo STEP 6: Seeding Database
echo ========================================
C:\xampp\php\php.exe artisan db:seed --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed database
) else (
    echo [OK] Database seeded successfully!
    echo.
    echo Default users created:
    echo   - admin@inventory.com / admin123 ^(Super Admin^)
    echo   - warehouse@inventory.com / admin123 ^(Warehouse Manager^)
    echo   - distributor@inventory.com / admin123 ^(Distributor^)
    echo   - agent@inventory.com / admin123 ^(Sales Agent^)
    echo   - store@inventory.com / admin123 ^(Store Manager^)
)
echo.

echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo To start the server, run:
echo   C:\xampp\php\php.exe artisan serve
echo.
echo Or double-click: start-server-xampp.bat
echo.
echo The API will be available at: http://localhost:8000
echo.
pause

