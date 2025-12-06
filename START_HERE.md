# 🚀 START HERE - Laravel Backend Setup

## ⚡ Quick Setup (3 Steps)

### Step 1: Run Setup Script

**Windows PowerShell:**
```powershell
cd backend
.\setup.ps1
```

**Windows Command Prompt:**
```cmd
cd backend
setup.bat
```

**Linux/Mac:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env with your database credentials
php artisan migrate
php artisan db:seed
```

### Step 2: Configure Database

When prompted (or manually), edit `backend/.env` file:

```env
DB_DATABASE=inventory_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

Make sure:
- MySQL is running
- Database `inventory_db` exists (or create it)
- Credentials are correct

### Step 3: Start Server

**Windows:**
```cmd
cd backend
start-server.bat
```

**Or manually:**
```bash
cd backend
php artisan serve
```

Server will start at: **http://localhost:8000**

## ✅ What's Included

- ✅ Complete Laravel backend with all API endpoints
- ✅ Database migrations (9 tables)
- ✅ Default users seeder
- ✅ Setup scripts for easy installation
- ✅ Frontend already configured to use Laravel backend

## 🔑 Default Login Credentials

After running `php artisan db:seed`:

- **Super Admin**: admin@inventory.com / admin123
- **Warehouse Manager**: warehouse@inventory.com / admin123
- **Distributor**: distributor@inventory.com / admin123
- **Sales Agent**: agent@inventory.com / admin123
- **Store Manager**: store@inventory.com / admin123

## 📝 What the Setup Script Does

1. ✅ Checks PHP and Composer installation
2. ✅ Installs Composer dependencies
3. ✅ Creates `.env` file from `.env.example`
4. ✅ Generates application key
5. ✅ Runs database migrations
6. ✅ Seeds database with default users (optional)

## 🎯 After Setup

1. **Start Laravel server**: `php artisan serve` or `start-server.bat`
2. **Open your frontend** HTML files in browser
3. **Login** with admin@inventory.com / admin123
4. **Everything should work!** 🎉

## 📚 More Information

- See `SETUP_COMPLETE.md` for full details
- See `backend/README.md` for Laravel documentation
- See `MIGRATION_TO_LARAVEL.md` for migration details

## 🆘 Troubleshooting

**Composer not found?**
- Install from: https://getcomposer.org/

**PHP not found?**
- Install PHP 8.1+ from: https://www.php.net/downloads.php

**Database error?**
- Check MySQL is running
- Verify credentials in `.env`
- Make sure database exists

**Permission errors?**
- Make sure `storage/` and `bootstrap/cache/` are writable

---

**Ready? Run the setup script now!** 🚀

