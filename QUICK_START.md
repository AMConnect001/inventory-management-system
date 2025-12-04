# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ MySQL root password ready

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File
Create `.env.local` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_db

JWT_SECRET=change_this_to_a_random_secret_key
JWT_REFRESH_SECRET=change_this_to_another_random_secret_key

NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Replace `your_mysql_password` with your actual MySQL password!**

### Step 3: Initialize Database
```bash
npm run init-db
```

This creates the database, tables, and default users.

### Step 4: Start Server
```bash
npm run dev
```

### Step 5: Login
Open `http://localhost:3000` and login with:
- Email: `admin@inventory.com`
- Password: `admin123`

## 📋 Default Users

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@inventory.com | admin123 |
| Warehouse Manager | warehouse@inventory.com | warehouse123 |
| Distributor | distributor@inventory.com | distributor123 |
| Sales Agent | agent@inventory.com | agent123 |
| Store Manager | store@inventory.com | store123 |

## 🎯 What's Included

- ✅ Full authentication system with JWT
- ✅ Role-based access control
- ✅ Products management
- ✅ Inventory tracking per location
- ✅ Stock movement/transfer system
- ✅ Activity logging
- ✅ MySQL database backend
- ✅ RESTful API endpoints
- ✅ Modern UI with Bootstrap 5

## 📁 Project Structure

```
├── app/              # Next.js pages and API routes
├── components/        # React components
├── lib/              # Utilities (db, auth)
├── database/         # Database schema
└── scripts/          # Database initialization

```

## 🔧 Troubleshooting

**Database connection error?**
- Check MySQL is running: `mysql -u root -p`
- Verify `.env.local` has correct credentials
- Make sure database doesn't already exist (or drop it first)

**Port 3000 already in use?**
- Kill the process or change port in `package.json`

**Module errors?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 🎉 You're Ready!

The application is now running at `http://localhost:3000`

