# Complete Setup Instructions

## Current Status

✅ PHP Found: C:\xampp\php\php.exe (PHP 8.0.28)  
✅ Composer Downloaded: composer.phar  
⚠️ Dependencies: Need to be installed  
✅ .env file: Ready to create  
⏳ Application Key: Pending  
⏳ Migrations: Pending  
⏳ Database Seeding: Pending  

## ⚠️ Important: PHP Version

**Current PHP**: 8.0.28  
**Laravel 10 Requires**: PHP 8.1+  

You have two options:

### Option 1: Update PHP (Recommended)
- Download XAMPP with PHP 8.1+ from https://www.apachefriends.org/
- Or install PHP 8.1+ separately and update the path

### Option 2: Continue with PHP 8.0 (May have issues)
- Some features might not work
- You may encounter compatibility issues

## Quick Setup (Choose One)

### Method 1: Batch File (Easiest)
```cmd
cd backend
complete-setup.bat
```

### Method 2: Manual Commands
```powershell
cd backend

# 1. Install dependencies (takes 5-10 minutes)
C:\xampp\php\php.exe composer.phar install --no-interaction

# 2. Create .env file (if not exists)
# Edit .env and set DB_PASSWORD if needed

# 3. Generate application key
C:\xampp\php\php.exe artisan key:generate

# 4. Make sure MySQL is running and database exists
# Create database: CREATE DATABASE inventory_db;

# 5. Run migrations
C:\xampp\php\php.exe artisan migrate

# 6. Seed database
C:\xampp\php\php.exe artisan db:seed
```

## Database Setup

1. **Start MySQL** (via XAMPP Control Panel)

2. **Create Database** (if not exists):
   ```sql
   CREATE DATABASE inventory_db;
   ```

3. **Edit .env file**:
   - Set `DB_PASSWORD=` if MySQL has no password
   - Set `DB_PASSWORD=yourpassword` if MySQL has a password

## After Setup

Start the server:
```cmd
C:\xampp\php\php.exe artisan serve
```

Or use:
```cmd
start-server-xampp.bat
```

## Default Users (After Seeding)

- **Super Admin**: admin@inventory.com / admin123
- **Warehouse Manager**: warehouse@inventory.com / admin123
- **Distributor**: distributor@inventory.com / admin123
- **Sales Agent**: agent@inventory.com / admin123
- **Store Manager**: store@inventory.com / admin123

## Troubleshooting

**Composer install fails?**
- Check internet connection
- Try: `C:\xampp\php\php.exe composer.phar install --no-interaction --prefer-dist`

**Database connection error?**
- Check MySQL is running
- Verify database exists
- Check credentials in .env

**PHP version error?**
- Update to PHP 8.1+ (recommended)
- Or modify composer.json to allow PHP 8.0 (not recommended)

