# Backend API Documentation

Complete API reference for the Inventory Management System backend.

## Base URL
```
http://localhost:3000/api
```

All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication

### POST `/api/auth/login`
Login and get authentication token.

**Request Body:**
```json
{
  "email": "admin@inventory.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@inventory.com",
    "name": "Super Admin",
    "role": "super_admin",
    "location_id": null
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### GET `/api/auth/me`
Get current authenticated user information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@inventory.com",
    "name": "Super Admin",
    "role": "super_admin",
    "location_id": null
  }
}
```

---

## Products

### GET `/api/products`
Get all products with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`)
- `category` (optional): Filter by category

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "sku": "SKU123",
      "category": "Category",
      "unit_price": 29.99,
      "description": "Product description",
      "status": "active",
      "low_stock_threshold": 10,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/products`
Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "sku": "SKU123",
  "category": "Category",
  "unit_price": 29.99,
  "description": "Product description",
  "status": "active"
}
```

### GET `/api/products/[id]`
Get a specific product by ID.

### PUT `/api/products/[id]`
Update a product.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "unit_price": 39.99,
  "status": "inactive"
}
```

### DELETE `/api/products/[id]`
Delete a product.

---

## Inventory

### GET `/api/inventory`
Get inventory items. Automatically filtered by user's location for non-admin users.

**Query Parameters:**
- `location_id` (optional): Filter by location (admin only)

**Response:**
```json
{
  "inventory": [
    {
      "id": 1,
      "location_id": 1,
      "product_id": 1,
      "quantity": 100,
      "unit_price": 29.99,
      "product_name": "Product Name",
      "category": "Category",
      "sku": "SKU123",
      "location_name": "Main Warehouse",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/inventory`
Update inventory (add or subtract stock).

**Request Body:**
```json
{
  "location_id": 1,
  "product_id": 1,
  "quantity": 10,
  "unit_price": 29.99
}
```

**Note:** Positive quantity adds stock, negative subtracts.

### POST `/api/inventory/initial-stock`
Add initial stock to a warehouse. Only available to warehouse managers and super admins.

**Request Body:**
```json
{
  "location_id": 1,
  "product_id": 1,
  "quantity": 100,
  "unit_price": 29.99
}
```

**Requirements:**
- Location must be a warehouse
- User must be warehouse manager or super admin
- Non-admin users can only add to their own warehouse

---

## Stock Movements

### GET `/api/movements`
Get all stock movements. Automatically filtered by user's location for non-admin users.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `approved`, `received`, `cancelled`)
- `from_location_id` (optional): Filter by source location
- `to_location_id` (optional): Filter by destination location

**Response:**
```json
{
  "movements": [
    {
      "id": 1,
      "from_location_id": 1,
      "to_location_id": 2,
      "status": "pending",
      "notes": "Transfer notes",
      "created_by": 1,
      "from_location_name": "Main Warehouse",
      "to_location_name": "Distributor A",
      "created_by_name": "Super Admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "movement_id": 1,
          "product_id": 1,
          "quantity": 10,
          "unit_price": 29.99,
          "product_name": "Product Name"
        }
      ]
    }
  ]
}
```

### POST `/api/movements`
Create a new stock movement.

**Request Body:**
```json
{
  "from_location_id": 1,
  "to_location_id": 2,
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "unit_price": 29.99
    }
  ],
  "notes": "Optional notes"
}
```

**Validation:**
- Location hierarchy must be valid (warehouse → distributor → sales_agent → store)
- Source location must have sufficient stock
- Non-admin users can only send from their own location
- Source and destination must be different

### GET `/api/movements/[id]`
Get a specific movement with full details including activities.

**Response:**
```json
{
  "movement": {
    "id": 1,
    "from_location_id": 1,
    "to_location_id": 2,
    "status": "pending",
    "items": [...],
    "activities": [
      {
        "id": 1,
        "movement_id": 1,
        "action": "Created",
        "description": "Movement created",
        "user_id": 1,
        "user_name": "Super Admin",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### PUT `/api/movements/[id]`
Update movement status.

**Request Body:**
```json
{
  "status": "approved",
  "action": "Approved",
  "description": "Movement approved by manager"
}
```

**Status Values:**
- `pending` - Initial status
- `approved` - Approved by manager
- `received` - Stock received at destination (automatically updates inventory)
- `cancelled` - Movement cancelled

**Note:** When status is set to `received`, inventory is automatically:
- Deducted from source location
- Added to destination location

---

## Locations

### GET `/api/locations`
Get all locations.

**Query Parameters:**
- `type` (optional): Filter by type (`warehouse`, `distributor`, `sales_agent`, `store`)

**Response:**
```json
{
  "locations": [
    {
      "id": 1,
      "name": "Main Warehouse",
      "type": "warehouse",
      "role": "warehouse_manager",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Activity Logs

### GET `/api/activity-logs`
Get activity logs.

**Query Parameters:**
- `limit` (optional): Maximum number of logs to return (default: 100)

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "Product Created",
      "description": "Created product: Product Name",
      "entity_type": "product",
      "entity_id": 1,
      "user_name": "Super Admin",
      "user_email": "admin@inventory.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/activity-logs`
Create an activity log entry.

**Request Body:**
```json
{
  "action": "Product Created",
  "description": "Created product: Product Name",
  "entity_type": "product",
  "entity_id": 1
}
```

---

## Dashboard

### GET `/api/dashboard/stats`
Get dashboard statistics.

**Response:**
```json
{
  "stats": {
    "totalProducts": 50,
    "totalInventory": 1000,
    "pendingMovements": 5,
    "activityLogs": 150,
    "totalValue": 29990.00,
    "avgValue": 29.99,
    "uniqueProducts": 25
  }
}
```

**Note:** Statistics are automatically filtered by user's location for non-admin users.

---

## User Management (Super Admin Only)

### GET `/api/users`
Get all users. Only accessible to super admin.

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@inventory.com",
      "name": "Super Admin",
      "role": "super_admin",
      "location_id": null,
      "location_name": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/users`
Create a new user. Only accessible to super admin.

**Request Body:**
```json
{
  "email": "newuser@inventory.com",
  "password": "password123",
  "name": "New User",
  "role": "sales_agent",
  "location_id": 4
}
```

### GET `/api/users/[id]`
Get a specific user. Users can view their own profile, super admin can view any.

### PUT `/api/users/[id]`
Update a user. Users can update their own profile, super admin can update any.

**Request Body:** (all fields optional)
```json
{
  "email": "updated@inventory.com",
  "name": "Updated Name",
  "password": "newpassword",
  "role": "distributor",
  "location_id": 2
}
```

**Note:** Only super admin can change role.

### DELETE `/api/users/[id]`
Delete a user. Only accessible to super admin. Cannot delete your own account.

---

## Error Responses

All endpoints return standard error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden"
}
```

**400 Bad Request:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Location Hierarchy

The system enforces a strict location hierarchy for stock movements:

- **Warehouse** → can send to: Distributor
- **Distributor** → can send to: Sales Agent
- **Sales Agent** → can send to: Store
- **Store** → cannot send to anyone

Attempts to create movements that violate this hierarchy will return a 400 error.

---

## Role-Based Access Control

### Super Admin
- Full access to all endpoints
- Can manage users
- Can view all locations and inventory

### Warehouse Manager
- Can add initial stock to their warehouse
- Can create movements from their warehouse
- Can view their warehouse inventory

### Distributor
- Can create movements from their location
- Can view their location inventory

### Sales Agent
- Can create movements from their location
- Can view their location inventory

### Store Manager
- Can view their location inventory
- Cannot create movements (receives stock only)


