# Laravel Backend Setup Script for XAMPP
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Laravel Backend Setup (XAMPP)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$phpPath = "C:\xampp\php\php.exe"

# Check if PHP exists
if (-not (Test-Path $phpPath)) {
    Write-Host "[ERROR] PHP not found at $phpPath" -ForegroundColor Red
    Write-Host "Please install XAMPP or update the PHP path in this script" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] PHP found: $phpPath" -ForegroundColor Green
& $phpPath --version
Write-Host ""

# Step 1: Download Composer if not exists
Write-Host "Step 1: Checking Composer..." -ForegroundColor Yellow
$composerPath = ".\composer.phar"

if (-not (Test-Path $composerPath)) {
    Write-Host "Downloading Composer..." -ForegroundColor Yellow
    try {
        $composerUrl = "https://getcomposer.org/download/latest-stable/composer.phar"
        Invoke-WebRequest -Uri $composerUrl -OutFile $composerPath -UseBasicParsing
        Write-Host "[OK] Composer downloaded" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to download Composer: $_" -ForegroundColor Red
        Write-Host "Please download Composer manually from: https://getcomposer.org/download/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[OK] Composer already exists" -ForegroundColor Green
}
Write-Host ""

# Step 2: Create .env file
Write-Host "Step 2: Creating .env file..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    $envContent = @"
APP_NAME="Inventory Management System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory_db
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="`${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="`${APP_NAME}"

JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
"@
    $envContent | Out-File -FilePath .env -Encoding utf8
    Write-Host "[OK] .env file created" -ForegroundColor Green
    Write-Host "Please edit .env and set your database password if needed" -ForegroundColor Cyan
} else {
    Write-Host "[OK] .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 3: Install dependencies
Write-Host "Step 3: Installing Composer dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
& $phpPath $composerPath install --no-interaction
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 4: Generate application key
Write-Host "Step 4: Generating application key..." -ForegroundColor Yellow
& $phpPath artisan key:generate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to generate application key" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Application key generated" -ForegroundColor Green
Write-Host ""

# Step 5: Run migrations
Write-Host "Step 5: Running database migrations..." -ForegroundColor Yellow
Write-Host "Make sure MySQL is running and database 'inventory_db' exists" -ForegroundColor Cyan
$runMigrations = Read-Host "Do you want to run migrations now? (y/n)"
if ($runMigrations -eq "y" -or $runMigrations -eq "Y") {
    & $phpPath artisan migrate --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to run migrations" -ForegroundColor Red
        Write-Host "Please check your database configuration in .env" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Migrations completed" -ForegroundColor Green
        
        # Step 6: Seed database
        Write-Host ""
        Write-Host "Step 6: Seeding database..." -ForegroundColor Yellow
        $seed = Read-Host "Do you want to seed the database with default users? (y/n)"
        if ($seed -eq "y" -or $seed -eq "Y") {
            & $phpPath artisan db:seed --force
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[ERROR] Failed to seed database" -ForegroundColor Red
            } else {
                Write-Host "[OK] Database seeded with default users" -ForegroundColor Green
                Write-Host ""
                Write-Host "Default users created:" -ForegroundColor Cyan
                Write-Host "  - admin@inventory.com / admin123 (Super Admin)" -ForegroundColor White
                Write-Host "  - warehouse@inventory.com / admin123 (Warehouse Manager)" -ForegroundColor White
                Write-Host "  - distributor@inventory.com / admin123 (Distributor)" -ForegroundColor White
                Write-Host "  - agent@inventory.com / admin123 (Sales Agent)" -ForegroundColor White
                Write-Host "  - store@inventory.com / admin123 (Store Manager)" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "[SKIP] Migrations skipped" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the Laravel server, run:" -ForegroundColor Yellow
Write-Host "  C:\xampp\php\php.exe artisan serve" -ForegroundColor White
Write-Host ""
Write-Host "Or use: .\start-server-xampp.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "The API will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host ""

