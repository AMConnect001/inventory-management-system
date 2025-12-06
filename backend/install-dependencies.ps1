# Install dependencies and wait for completion
Write-Host "Starting dependency installation..." -ForegroundColor Yellow
Write-Host "This will take 5-10 minutes. Please wait..." -ForegroundColor Cyan
Write-Host ""

$process = Start-Process -FilePath "C:\xampp\php\php.exe" -ArgumentList "composer.phar","install","--no-interaction","--prefer-dist" -WorkingDirectory "C:\Users\HP\Downloads\Invenstory stock flow\backend" -PassThru -NoNewWindow -Wait

if ($process.ExitCode -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Continue with next steps
    Write-Host "Step 2: Creating .env file..." -ForegroundColor Yellow
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
    } else {
        Write-Host "[OK] .env file already exists" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Step 3: Generating application key..." -ForegroundColor Yellow
    C:\xampp\php\php.exe artisan key:generate --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Application key generated" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure MySQL is running" -ForegroundColor White
    Write-Host "2. Create database: inventory_db" -ForegroundColor White
    Write-Host "3. Run: C:\xampp\php\php.exe artisan migrate" -ForegroundColor White
    Write-Host "4. Run: C:\xampp\php\php.exe artisan db:seed" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Installation failed with exit code: $($process.ExitCode)" -ForegroundColor Red
}

