// API Utility Functions - Centralized API calls for the Inventory Management System

const API = {
    baseURL: '/api',
    
    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint (e.g., '/products')
     * @param {object} options - Fetch options (method, body, headers, etc.)
     * @returns {Promise} - Response data
     */
    async request(endpoint, options = {}) {
        const token = Auth.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };
        
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });
            
            // Handle 401 Unauthorized - token expired
            if (response.status === 401) {
                // Try to refresh token
                const refreshed = await Auth.refreshToken();
                if (refreshed.success && refreshed.token) {
                    // Retry request with new token
                    headers['Authorization'] = `Bearer ${refreshed.token}`;
                    const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                        ...options,
                        headers
                    });
                    
                    if (!retryResponse.ok) {
                        Auth.logout();
                        throw new Error('Session expired. Please login again.');
                    }
                    
                    return await retryResponse.json();
                } else {
                    Auth.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ==================== PRODUCTS ====================
    
    /**
     * Get all products
     * @param {object} filters - Optional filters (status, category)
     * @returns {Promise<{products: Array}>}
     */
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/products${query}`);
    },
    
    /**
     * Get a single product by ID
     * @param {number} id - Product ID
     * @returns {Promise<{product: Object}>}
     */
    async getProduct(id) {
        return this.request(`/products/${id}`);
    },
    
    /**
     * Create a new product
     * @param {object} product - Product data
     * @returns {Promise<{product: Object}>}
     */
    async createProduct(product) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
    },
    
    /**
     * Update a product
     * @param {number} id - Product ID
     * @param {object} product - Updated product data
     * @returns {Promise<{product: Object}>}
     */
    async updateProduct(id, product) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    },
    
    /**
     * Delete a product
     * @param {number} id - Product ID
     * @returns {Promise<{success: boolean}>}
     */
    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    },
    
    // ==================== INVENTORY ====================
    
    /**
     * Get inventory items (filtered by user's location for non-admin)
     * @param {number} locationId - Optional location ID (admin only)
     * @returns {Promise<{inventory: Array}>}
     */
    async getInventory(locationId = null) {
        const query = locationId ? `?location_id=${locationId}` : '';
        return this.request(`/inventory${query}`);
    },
    
    /**
     * Update inventory (add or subtract stock)
     * @param {object} data - {location_id, product_id, quantity, unit_price}
     * @returns {Promise<{inventory: Object}>}
     */
    async updateInventory(data) {
        return this.request('/inventory', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * Add initial stock to a warehouse
     * @param {object} data - {location_id, product_id, quantity, unit_price}
     * @returns {Promise<{inventory: Object}>}
     */
    async addInitialStock(data) {
        return this.request('/inventory/initial-stock', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // ==================== MOVEMENTS ====================
    
    /**
     * Get all movements (filtered by user's location for non-admin)
     * @param {object} filters - Optional filters (status, from_location_id, to_location_id)
     * @returns {Promise<{movements: Array}>}
     */
    async getMovements(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.from_location_id) params.append('from_location_id', filters.from_location_id);
        if (filters.to_location_id) params.append('to_location_id', filters.to_location_id);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/movements${query}`);
    },
    
    /**
     * Get a single movement by ID
     * @param {number} id - Movement ID
     * @returns {Promise<{movement: Object}>}
     */
    async getMovement(id) {
        return this.request(`/movements/${id}`);
    },
    
    /**
     * Create a new movement
     * @param {object} movement - Movement data {from_location_id, to_location_id, items[], notes}
     * @returns {Promise<{movement: Object}>}
     */
    async createMovement(movement) {
        return this.request('/movements', {
            method: 'POST',
            body: JSON.stringify(movement)
        });
    },
    
    /**
     * Update movement status (approve, receive, cancel)
     * @param {number} id - Movement ID
     * @param {string} status - New status (approved, received, cancelled)
     * @param {string} action - Action name (e.g., "Approved", "Received")
     * @param {string} description - Action description
     * @returns {Promise<{movement: Object}>}
     */
    async updateMovementStatus(id, status, action, description) {
        return this.request(`/movements/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, action, description })
        });
    },
    
    // ==================== LOCATIONS ====================
    
    /**
     * Get all locations
     * @param {string} type - Optional filter by type (warehouse, distributor, sales_agent, store)
     * @returns {Promise<{locations: Array}>}
     */
    async getLocations(type = null) {
        const query = type ? `?type=${type}` : '';
        return this.request(`/locations${query}`);
    },
    
    // ==================== USERS ====================
    
    /**
     * Get all users (admin only)
     * @returns {Promise<{users: Array}>}
     */
    async getUsers() {
        return this.request('/users');
    },
    
    /**
     * Get a single user by ID
     * @param {number} id - User ID
     * @returns {Promise<{user: Object}>}
     */
    async getUser(id) {
        return this.request(`/users/${id}`);
    },
    
    /**
     * Create a new user (admin only)
     * @param {object} user - User data
     * @returns {Promise<{user: Object}>}
     */
    async createUser(user) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(user)
        });
    },
    
    /**
     * Update a user
     * @param {number} id - User ID
     * @param {object} user - Updated user data
     * @returns {Promise<{user: Object}>}
     */
    async updateUser(id, user) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        });
    },
    
    /**
     * Delete a user (admin only)
     * @param {number} id - User ID
     * @returns {Promise<{success: boolean}>}
     */
    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    },
    
    // ==================== ACTIVITY LOGS ====================
    
    /**
     * Get activity logs
     * @param {number} limit - Maximum number of logs to return (default: 100)
     * @returns {Promise<{logs: Array}>}
     */
    async getActivityLogs(limit = 100) {
        return this.request(`/activity-logs?limit=${limit}`);
    },
    
    // ==================== DASHBOARD ====================
    
    /**
     * Get dashboard statistics
     * @returns {Promise<{stats: Object}>}
     */
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }
};

