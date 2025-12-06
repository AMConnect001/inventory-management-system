# Laravel Backend Setup Guide

## Quick Start

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Configure database in `.env`**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=inventory_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed database (optional - creates default users)**
   ```bash
   php artisan db:seed
   ```

8. **Start the server**
   ```bash
   php artisan serve
   ```

The API will be available at `http://localhost:8000`

## Default Users

After running `php artisan db:seed`, these users will be created:

- **Super Admin**: admin@inventory.com / admin123
- **Warehouse Manager**: warehouse@inventory.com / admin123
- **Distributor**: distributor@inventory.com / admin123
- **Sales Agent**: agent@inventory.com / admin123
- **Store Manager**: store@inventory.com / admin123

## Testing the API

You can test the login endpoint:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"admin123"}'
```

## Frontend Integration

The frontend has been configured to use `http://localhost:8000/api` as the API base URL. Make sure:

1. Laravel backend is running on port 8000
2. CORS is properly configured (already set up in `config/cors.php`)
3. Frontend is pointing to the correct API URL (already updated in `js/api.js` and `js/auth.js`)

## Troubleshooting

### CORS Issues
- Check `config/cors.php` - already configured for `localhost:3000`
- Make sure `HandleCors` middleware is in the middleware stack

### Database Connection Issues
- Verify database credentials in `.env`
- Make sure MySQL is running
- Check database exists: `inventory_db`

### Token Issues
- Clear browser localStorage
- Login again to get a new token
- Check `storage/logs/laravel.log` for errors

### 500 Errors
- Check `storage/logs/laravel.log`
- Make sure `storage/` directory is writable
- Run `php artisan config:clear` and `php artisan cache:clear`

## Production Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Ensure proper file permissions on `storage/` and `bootstrap/cache/`
5. Configure web server to point to `public/` directory

