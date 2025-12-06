# Inventory Management System - Laravel Backend

This is the Laravel backend API for the Inventory Management System.

## Requirements

- PHP >= 8.1
- Composer
- MySQL >= 5.7
- Node.js & NPM (for frontend assets if needed)

## Installation

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure Database**
   Edit `.env` file and set your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=inventory_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Seed Database (Optional)**
   ```bash
   php artisan db:seed
   ```
   This will create default locations and users:
   - Super Admin: admin@inventory.com / admin123
   - Warehouse Manager: warehouse@inventory.com / admin123
   - Distributor: distributor@inventory.com / admin123
   - Sales Agent: agent@inventory.com / admin123
   - Store Manager: store@inventory.com / admin123

6. **Start Development Server**
   ```bash
   php artisan serve
   ```
   The API will be available at `http://localhost:8000`

## API Endpoints

All API endpoints are prefixed with `/api`:

- **Authentication**
  - `POST /api/auth/login` - Login
  - `GET /api/auth/me` - Get current user

- **Products**
  - `GET /api/products` - List products
  - `POST /api/products` - Create product
  - `GET /api/products/{id}` - Get product
  - `PUT /api/products/{id}` - Update product
  - `DELETE /api/products/{id}` - Delete product

- **Inventory**
  - `GET /api/inventory` - List inventory
  - `POST /api/inventory` - Update inventory
  - `POST /api/inventory/initial-stock` - Add initial stock

- **Movements**
  - `GET /api/movements` - List movements
  - `POST /api/movements` - Create movement
  - `GET /api/movements/{id}` - Get movement
  - `PUT /api/movements/{id}` - Update movement status

- **Locations**
  - `GET /api/locations` - List locations

- **Users** (Super Admin only)
  - `GET /api/users` - List users
  - `POST /api/users` - Create user
  - `GET /api/users/{id}` - Get user
  - `PUT /api/users/{id}` - Update user
  - `DELETE /api/users/{id}` - Delete user

- **Activity Logs**
  - `GET /api/activity-logs` - List activity logs
  - `POST /api/activity-logs` - Create activity log

- **Dashboard**
  - `GET /api/dashboard/stats` - Get dashboard statistics

## Authentication

The API uses Laravel Sanctum for authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

## CORS Configuration

CORS is configured to allow requests from `http://localhost:3000`. Update `config/cors.php` if needed.

## Database Schema

The database schema matches the existing Next.js implementation. All migrations are in `database/migrations/`.

## Frontend Integration

The frontend has been updated to point to `http://localhost:8000/api` instead of `http://localhost:3000/api`.

## Troubleshooting

1. **CORS Issues**: Make sure CORS is properly configured in `config/cors.php`
2. **Database Connection**: Verify database credentials in `.env`
3. **Token Issues**: Clear browser localStorage and login again
4. **500 Errors**: Check `storage/logs/laravel.log` for detailed error messages

## Production Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Run `php artisan config:cache` and `php artisan route:cache`
3. Ensure proper database credentials and security settings
4. Configure web server (Nginx/Apache) to point to `public/` directory

