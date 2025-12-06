@echo off
echo ========================================
echo Completing Laravel Setup
echo ========================================
echo.

echo Step 1: Installing Composer dependencies...
echo This may take 5-10 minutes, please wait...
echo.
C:\xampp\php\php.exe composer.phar install --no-interaction
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 2: Creating .env file...
if not exist .env (
    echo APP_NAME="Inventory Management System" > .env
    echo APP_ENV=local >> .env
    echo APP_KEY= >> .env
    echo APP_DEBUG=true >> .env
    echo APP_TIMEZONE=UTC >> .env
    echo APP_URL=http://localhost:8000 >> .env
    echo. >> .env
    echo DB_CONNECTION=mysql >> .env
    echo DB_HOST=127.0.0.1 >> .env
    echo DB_PORT=3306 >> .env
    echo DB_DATABASE=inventory_db >> .env
    echo DB_USERNAME=root >> .env
    echo DB_PASSWORD= >> .env
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)
echo.

echo Step 3: Generating application key...
C:\xampp\php\php.exe artisan key:generate --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate application key
    pause
    exit /b 1
)
echo [OK] Application key generated
echo.

echo Step 4: Database Configuration
echo Please make sure:
echo   1. MySQL is running
echo   2. Database 'inventory_db' exists
echo   3. Edit .env file if MySQL has a password
echo.
pause

echo Step 5: Running database migrations...
C:\xampp\php\php.exe artisan migrate --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run migrations
    echo Please check your database configuration in .env
    pause
    exit /b 1
)
echo [OK] Migrations completed
echo.

echo Step 6: Seeding database with default users...
C:\xampp\php\php.exe artisan db:seed --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed database
) else (
    echo [OK] Database seeded
    echo.
    echo Default users created:
    echo   - admin@inventory.com / admin123
    echo   - warehouse@inventory.com / admin123
    echo   - distributor@inventory.com / admin123
    echo   - agent@inventory.com / admin123
    echo   - store@inventory.com / admin123
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the server, run:
echo   C:\xampp\php\php.exe artisan serve
echo.
pause

