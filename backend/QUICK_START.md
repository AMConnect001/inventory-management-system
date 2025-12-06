# Quick Start Guide

## Prerequisites

- PHP >= 8.1
- Composer
- MySQL Database

## Automatic Setup (Windows)

### Option 1: PowerShell Script
```powershell
cd backend
.\setup.ps1
```

### Option 2: Batch File
```cmd
cd backend
setup.bat
```

## Manual Setup

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Configure Environment
```bash
# Copy .env.example to .env (if not exists)
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Edit .env File
Set your database credentials:
```env
DB_DATABASE=inventory_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Run Migrations
```bash
php artisan migrate
```

### 5. Seed Database (Optional)
```bash
php artisan db:seed
```

This creates default users:
- **Super Admin**: admin@inventory.com / admin123
- **Warehouse Manager**: warehouse@inventory.com / admin123
- **Distributor**: distributor@inventory.com / admin123
- **Sales Agent**: agent@inventory.com / admin123
- **Store Manager**: store@inventory.com / admin123

### 6. Start Server
```bash
php artisan serve
```

Or use the provided scripts:
- Windows: `start-server.bat` or `start-server.ps1`
- Linux/Mac: `php artisan serve`

## Access the API

Once the server is running, the API will be available at:
- **Base URL**: `http://localhost:8000/api`

## Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@inventory.com\",\"password\":\"admin123\"}"
```

## Frontend Integration

The frontend has already been configured to use `http://localhost:8000/api` as the API base URL.

Just make sure:
1. Laravel backend is running (`php artisan serve`)
2. Open your frontend HTML files in a browser
3. Login with the default credentials

## Troubleshooting

### Composer not found
- Install Composer from https://getcomposer.org/
- Make sure it's in your system PATH

### PHP not found
- Install PHP 8.1+ from https://www.php.net/downloads.php
- Make sure it's in your system PATH

### Database connection error
- Check MySQL is running
- Verify credentials in `.env`
- Make sure database `inventory_db` exists

### Permission errors
- Make sure `storage/` and `bootstrap/cache/` directories are writable

### CORS errors
- CORS is already configured for `localhost:3000`
- Check `config/cors.php` if you need to add more origins

