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
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up MySQL database**:
   - Make sure MySQL is running
   - Create a `.env.local` file in the root directory:
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

4. **Initialize the database**:
   ```bash
   node scripts/init-db.js
   ```
   
   This will:
   - Create the database and all tables
   - Insert default locations
   - Create default users with hashed passwords

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to `http://localhost:3000`

## Default Login Credentials

After running the database initialization script, you can log in with:

- **Super Admin**: `admin@inventory.com` / `admin123`
- **Warehouse Manager**: `warehouse@inventory.com` / `warehouse123`
- **Distributor**: `distributor@inventory.com` / `distributor123`
- **Sales Agent**: `agent@inventory.com` / `agent123`
- **Store Manager**: `store@inventory.com` / `store123`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── products/     # Product management
│   │   ├── inventory/    # Inventory management
│   │   ├── movements/    # Stock movements
│   │   └── locations/    # Location management
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   └── Layout.tsx        # Main layout component
├── lib/                  # Utility libraries
│   ├── db.ts            # Database connection
│   └── auth.ts          # Authentication utilities
├── database/            # Database files
│   └── schema.sql       # Database schema
└── scripts/             # Utility scripts
    └── init-db.js       # Database initialization script
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Inventory
- `GET /api/inventory` - Get inventory (filtered by user location)
- `POST /api/inventory` - Update inventory

### Movements
- `GET /api/movements` - Get all movements
- `POST /api/movements` - Create movement
- `GET /api/movements/[id]` - Get movement by ID
- `PUT /api/movements/[id]` - Update movement status

### Locations
- `GET /api/locations` - Get all locations

### Activity Logs
- `GET /api/activity-logs` - Get activity logs

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

## Security Notes

- Change the `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- Use strong passwords for MySQL database
- Implement rate limiting for API endpoints in production
- Use HTTPS in production
- Regularly update dependencies

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue in the repository.
