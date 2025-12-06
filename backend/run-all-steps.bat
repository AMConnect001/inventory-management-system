@echo off
echo ========================================
echo Laravel Backend Setup - All Steps
echo ========================================
echo.

echo Step 1: Installing dependencies...
echo This will take 5-10 minutes. Please wait...
echo.
C:\xampp\php\php.exe composer.phar install --no-interaction
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed successfully!
echo.

echo Step 2: Checking .env file...
if not exist .env (
    echo Creating .env file...
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
    echo.
    echo IMPORTANT: Please edit .env file and set DB_PASSWORD if MySQL has a password
    echo.
    pause
) else (
    echo [OK] .env file exists
)
echo.

echo Step 3: Generating application key...
C:\xampp\php\php.exe artisan key:generate --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate key
    pause
    exit /b 1
)
echo [OK] Application key generated
echo.

echo Step 4: Database Setup
echo.
echo Please make sure:
echo   1. MySQL is running (check XAMPP Control Panel)
echo   2. Database 'inventory_db' exists
echo      (Create it in phpMyAdmin or run:)
echo      C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS inventory_db;"
echo   3. Edit .env file if MySQL has a password
echo.
pause

echo.
echo Step 5: Running migrations...
C:\xampp\php\php.exe artisan migrate --force
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to run migrations
    echo Please check:
    echo   - MySQL is running
    echo   - Database 'inventory_db' exists
    echo   - Database credentials in .env are correct
    pause
    exit /b 1
)
echo [OK] Migrations completed
echo.

echo Step 6: Seeding database...
C:\xampp\php\php.exe artisan db:seed --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed database
) else (
    echo [OK] Database seeded successfully!
    echo.
    echo Default users created:
    echo   - admin@inventory.com / admin123 (Super Admin)
    echo   - warehouse@inventory.com / admin123 (Warehouse Manager)
    echo   - distributor@inventory.com / admin123 (Distributor)
    echo   - agent@inventory.com / admin123 (Sales Agent)
    echo   - store@inventory.com / admin123 (Store Manager)
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the server, run:
echo   C:\xampp\php\php.exe artisan serve
echo.
echo Or double-click: start-server-xampp.bat
echo.
pause

