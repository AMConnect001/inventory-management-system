# Test Links - Inventory Management System

## 🚀 Application URLs

### Frontend (Next.js)
**Main Application:** http://localhost:3000

### Backend API (Laravel)
**API Base URL:** http://localhost:8000/api
**API Health Check:** http://localhost:8000

## 🔐 Default Login Credentials

After running database seed, use these credentials:

- **Super Admin**
  - Email: `admin@inventory.com`
  - Password: `admin123`

- **Warehouse Manager**
  - Email: `warehouse@inventory.com`
  - Password: `admin123`

- **Distributor**
  - Email: `distributor@inventory.com`
  - Password: `admin123`

- **Sales Agent**
  - Email: `agent@inventory.com`
  - Password: `admin123`

- **Store Manager**
  - Email: `store@inventory.com`
  - Password: `admin123`

## 📋 Quick Setup Commands

If servers are not running, use:

```batch
REM Complete setup and start servers
COMPLETE_SETUP.bat

REM Or manually:
cd backend
C:\xampp\php\php.exe artisan serve

REM In another terminal:
npm run dev
```

## ✅ Testing Checklist

1. ✓ Open http://localhost:3000
2. ✓ Login with admin@inventory.com / admin123
3. ✓ Check Dashboard loads
4. ✓ Test Products page
5. ✓ Test Inventory page
6. ✓ Test Stock Movements
7. ✓ Test Activity Log

## 🔧 Troubleshooting

- **Backend not responding:** Make sure MySQL is running in XAMPP
- **Frontend not loading:** Check if npm run dev is running
- **Database errors:** Check backend\.env database credentials
- **Port already in use:** Stop other services using ports 3000 or 8000

