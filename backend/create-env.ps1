# Check if installation completed and continue setup
Write-Host "Checking installation status..." -ForegroundColor Cyan

if (Test-Path "vendor\autoload.php") {
    Write-Host "[SUCCESS] Dependencies installed!" -ForegroundColor Green
    Write-Host ""
    
    # Create .env file
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    if (-not (Test-Path .env)) {
        @"
APP_NAME="Inventory Management System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory_db
DB_USERNAME=root
DB_PASSWORD=

LOG_CHANNEL=stack
CACHE_DRIVER=file
SESSION_DRIVER=file
"@ | Out-File -FilePath .env -Encoding utf8
        Write-Host "[OK] .env file created" -ForegroundColor Green
    }
    
    # Generate key
    Write-Host "Generating application key..." -ForegroundColor Yellow
    C:\xampp\php\php.exe artisan key:generate --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Application key generated" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup Ready for Database!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next: Run migrations and seed database" -ForegroundColor Yellow
    Write-Host "  C:\xampp\php\php.exe artisan migrate" -ForegroundColor White
    Write-Host "  C:\xampp\php\php.exe artisan db:seed" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[PENDING] Dependencies still installing..." -ForegroundColor Yellow
    Write-Host "Please wait a few more minutes and run this script again." -ForegroundColor Cyan
}

