@echo off
echo ========================================
echo Laravel Backend Setup
echo ========================================
echo.

echo Checking PHP installation...
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PHP is not installed or not in PATH
    echo Please install PHP 8.1 or higher
    pause
    exit /b 1
)
echo [OK] PHP found

echo.
echo Checking Composer installation...
composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Composer is not installed or not in PATH
    echo Please install Composer from https://getcomposer.org/
    pause
    exit /b 1
)
echo [OK] Composer found

echo.
echo Step 1: Installing Composer dependencies...
composer install --no-interaction
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo Step 2: Creating .env file...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] .env file created from .env.example
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file already exists
)

echo.
echo Step 3: Generating application key...
php artisan key:generate --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate application key
    pause
    exit /b 1
)
echo [OK] Application key generated

echo.
echo Step 4: Configuring database...
echo Please edit .env file and set your database credentials:
echo   DB_DATABASE=inventory_db
echo   DB_USERNAME=root
echo   DB_PASSWORD=your_password
echo.
pause

echo.
echo Step 5: Running database migrations...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run migrations
    echo Please check your database configuration in .env
    pause
    exit /b 1
)
echo [OK] Migrations completed

echo.
set /p seed="Do you want to seed the database with default users? (y/n): "
if /i "%seed%"=="y" (
    echo Seeding database...
    php artisan db:seed --force
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to seed database
    ) else (
        echo [OK] Database seeded with default users
        echo.
        echo Default users created:
        echo   - admin@inventory.com / admin123 (Super Admin)
        echo   - warehouse@inventory.com / admin123 (Warehouse Manager)
        echo   - distributor@inventory.com / admin123 (Distributor)
        echo   - agent@inventory.com / admin123 (Sales Agent)
        echo   - store@inventory.com / admin123 (Store Manager)
    )
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the Laravel server, run:
echo   php artisan serve
echo.
echo The API will be available at: http://localhost:8000
echo.
pause

