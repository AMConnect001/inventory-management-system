# Download and install Composer
Write-Host "Downloading Composer..." -ForegroundColor Yellow

$composerUrl = "https://getcomposer.org/download/latest-stable/composer.phar"
$composerPath = ".\composer.phar"

try {
    Invoke-WebRequest -Uri $composerUrl -OutFile $composerPath -UseBasicParsing
    Write-Host "Composer downloaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use: C:\xampp\php\php.exe composer.phar install" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to download Composer: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download Composer manually from: https://getcomposer.org/download/" -ForegroundColor Yellow
}

