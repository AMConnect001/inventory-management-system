# Laravel Backend Setup Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Laravel Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PHP is installed
Write-Host "Checking PHP installation..." -ForegroundColor Yellow
try {
    $phpVersion = php -v 2>&1 | Select-Object -First 1
    Write-Host "✓ PHP found: $phpVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PHP is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PHP 8.1 or higher" -ForegroundColor Red
    exit 1
}

# Check if Composer is installed
Write-Host "Checking Composer installation..." -ForegroundColor Yellow
try {
    $composerVersion = composer --version 2>&1 | Select-Object -First 1
    Write-Host "✓ Composer found: $composerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Composer is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Composer from https://getcomposer.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing Composer dependencies..." -ForegroundColor Yellow
composer install --no-interaction
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Creating .env file..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✓ .env file created from .env.example" -ForegroundColor Green
    } else {
        Write-Host "✗ .env.example not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Generating application key..." -ForegroundColor Yellow
php artisan key:generate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate application key" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Application key generated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Configuring database..." -ForegroundColor Yellow
Write-Host "Please edit .env file and set your database credentials:" -ForegroundColor Cyan
Write-Host "  DB_DATABASE=inventory_db" -ForegroundColor White
Write-Host "  DB_USERNAME=root" -ForegroundColor White
Write-Host "  DB_PASSWORD=your_password" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Press Enter after you've configured the database, or type 'skip' to skip database setup"

if ($continue -ne "skip") {
    Write-Host ""
    Write-Host "Step 5: Running database migrations..." -ForegroundColor Yellow
    php artisan migrate --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to run migrations" -ForegroundColor Red
        Write-Host "Please check your database configuration in .env" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ Migrations completed" -ForegroundColor Green

    Write-Host ""
    Write-Host "Step 6: Seeding database..." -ForegroundColor Yellow
    $seed = Read-Host "Do you want to seed the database with default users? (y/n)"
    if ($seed -eq "y" -or $seed -eq "Y") {
        php artisan db:seed --force
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to seed database" -ForegroundColor Red
        } else {
            Write-Host "✓ Database seeded with default users" -ForegroundColor Green
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

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the Laravel server, run:" -ForegroundColor Yellow
Write-Host "  php artisan serve" -ForegroundColor White
Write-Host ""
Write-Host "The API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

