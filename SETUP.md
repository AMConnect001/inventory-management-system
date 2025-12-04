# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important**: Replace `your_mysql_password` with your actual MySQL root password.

## Step 3: Initialize Database

Make sure MySQL is running, then run:

```bash
npm run init-db
```

This will:
- Create the database `inventory_db`
- Create all necessary tables
- Insert default locations
- Create default users with hashed passwords

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Access the Application

Open your browser and go to: `http://localhost:3000`

## Default Login Credentials

- **Super Admin**: `admin@inventory.com` / `admin123`
- **Warehouse Manager**: `warehouse@inventory.com` / `warehouse123`
- **Distributor**: `distributor@inventory.com` / `distributor123`
- **Sales Agent**: `agent@inventory.com` / `agent123`
- **Store Manager**: `store@inventory.com` / `store123`

## Troubleshooting

### Database Connection Error

If you get a database connection error:
1. Make sure MySQL is running
2. Check your `.env.local` file has the correct credentials
3. Verify MySQL is accessible on the specified host and port

### Port Already in Use

If port 3000 is already in use:
1. Kill the process using port 3000, or
2. Change the port in `package.json` scripts: `next dev -p 3001`

### Module Not Found Errors

If you get module not found errors:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

