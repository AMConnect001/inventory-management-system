# Inventory Stock Flow - Fullstack Next.js Application

A modern, fullstack inventory management system built with Next.js 14, TypeScript, and MySQL.

## Features

- 📊 **Dashboard** - Overview of inventory statistics and recent transactions
- 📦 **Products Management** - Full CRUD operations for products
- 📋 **Inventory Management** - Track stock at multiple locations
- 🔄 **Stock Movements** - Transfer stock between locations with approval workflow
- 📈 **Activity Logs** - Track all system activities
- 🔐 **Authentication** - JWT-based authentication with role-based access control
- 👥 **Multi-role Support** - Super Admin, Warehouse Manager, Distributor, Sales Agent, Store Manager

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Bootstrap 5
- **Backend**: Laravel 8 (PHP)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (Bearer tokens)

## Prerequisites

- Node.js 18+ installed
- PHP 8.1+ installed
- Composer installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

## Installation

### Step 1: Setup Laravel Backend

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Edit `.env` file** and set your database credentials:
   ```env
   DB_DATABASE=inventory_db
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   ```

5. **Run migrations and seed database**:
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start Laravel server**:
   ```bash
   php artisan serve
   ```
   
   The API will be available at `http://localhost:8000`

### Step 2: Setup Next.js Frontend

1. **Return to root directory**:
   ```bash
   cd ..
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env.local` file** in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Default Login Credentials

After running `php artisan db:seed` in the backend directory, you can log in with:

- **Super Admin**: `admin@inventory.com` / `admin123`
- **Warehouse Manager**: `warehouse@inventory.com` / `admin123`
- **Distributor**: `distributor@inventory.com` / `admin123`
- **Sales Agent**: `agent@inventory.com` / `admin123`
- **Store Manager**: `store@inventory.com` / `admin123`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── products/         # Products page
│   ├── inventory/       # Inventory page
│   ├── movements/       # Movements page
│   └── activity-log/    # Activity log page
├── backend/              # Laravel backend
│   ├── app/Http/Controllers/Api/  # API controllers
│   ├── app/Models/       # Eloquent models
│   ├── database/migrations/  # Database migrations
│   └── routes/api.php    # API routes
├── components/           # React components
│   └── Layout.tsx        # Main layout component
├── lib/                  # Utility libraries
│   └── api.ts           # API client for Laravel backend
└── js/                   # Legacy JavaScript files (for HTML pages)
```

## API Endpoints

All API endpoints are provided by the Laravel backend at `http://localhost:8000/api`. See `BACKEND_API.md` for complete API documentation.

### Quick Reference:
- **Authentication**: `POST /api/auth/login`, `GET /api/auth/me`
- **Products**: `GET /api/products`, `POST /api/products`, `GET /api/products/{id}`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
- **Inventory**: `GET /api/inventory`, `POST /api/inventory`, `POST /api/inventory/initial-stock`
- **Movements**: `GET /api/movements`, `POST /api/movements`, `GET /api/movements/{id}`, `PUT /api/movements/{id}`
- **Locations**: `GET /api/locations`
- **Users**: `GET /api/users`, `POST /api/users`, `GET /api/users/{id}`, `PUT /api/users/{id}`, `DELETE /api/users/{id}` (admin only)
- **Activity Logs**: `GET /api/activity-logs`, `POST /api/activity-logs`
- **Dashboard**: `GET /api/dashboard/stats`

## Database Schema

The database includes the following main tables:
- `users` - User accounts
- `locations` - Warehouse, distributor, sales agent, and store locations
- `products` - Product catalog
- `inventory` - Stock levels at each location
- `movements` - Stock transfer requests
- `movement_items` - Items in each movement
- `movement_activities` - Activity log for movements
- `activity_logs` - General activity tracking

## Location Hierarchy

The system enforces a location hierarchy:
- **Warehouse** → can send to Distributor
- **Distributor** → can send to Sales Agent
- **Sales Agent** → can send to Store
- **Store** → cannot send to anyone

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Quick Start (Windows)

For Windows users, use the provided setup scripts:

1. **Setup Laravel backend**:
   ```powershell
   cd backend
   .\setup.ps1
   ```
   Or use: `setup.bat`

2. **Start Laravel server**:
   ```powershell
   .\start-server.ps1
   ```
   Or use: `start-server.bat`

3. **Setup Next.js frontend** (in root directory):
   ```bash
   npm install
   # Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000/api
   npm run dev
   ```

## Security Notes

- Change the `APP_KEY` in Laravel `.env` file for production
- Use strong passwords for MySQL database
- Set `APP_ENV=production` and `APP_DEBUG=false` in Laravel `.env` for production
- Implement rate limiting for API endpoints in production
- Use HTTPS in production
- Regularly update dependencies

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue in the repository.
