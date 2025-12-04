// Authentication Utilities

const Auth = {
    // Token storage keys
    TOKEN_KEY: 'inventory_auth_token',
    REFRESH_TOKEN_KEY: 'inventory_refresh_token',
    USER_KEY: 'inventory_user',
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Get stored token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },
    
    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    },
    
    // Get user data
    getUser() {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // Set authentication data
    setAuth(token, refreshToken, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },
    
    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },
    
    // Login function
    async login(email, password) {
        try {
            // Simulate API call - Replace with actual API endpoint
            // const response = await fetch('/api/auth/login', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email, password })
            // });
            // const data = await response.json();
            
            // Mock authentication for now
            // Default admin login
            if (email === 'admin@inventory.com' && password === 'admin123') {
                const mockUser = {
                    id: 1,
                    email: 'admin@inventory.com',
                    name: 'Super Admin',
                    role: 'super_admin',
                    permissions: ['all']
                };
                
                const mockToken = 'mock_jwt_token_' + Date.now();
                const mockRefreshToken = 'mock_refresh_token_' + Date.now();
                
                this.setAuth(mockToken, mockRefreshToken, mockUser);
                
                return {
                    success: true,
                    user: mockUser,
                    token: mockToken
                };
            }
            // Warehouse Manager login
            else if (email === 'warehouse@inventory.com' && password === 'warehouse123') {
                const mockUser = {
                    id: 2,
                    email: 'warehouse@inventory.com',
                    name: 'Warehouse Manager',
                    role: 'warehouse_manager',
                    permissions: ['view_inventory', 'add_stock', 'create_movement']
                };
                
                const mockToken = 'mock_jwt_token_' + Date.now();
                const mockRefreshToken = 'mock_refresh_token_' + Date.now();
                
                this.setAuth(mockToken, mockRefreshToken, mockUser);
                
                return {
                    success: true,
                    user: mockUser,
                    token: mockToken
                };
            }
            // Distributor login
            else if (email === 'distributor@inventory.com' && password === 'distributor123') {
                const mockUser = {
                    id: 3,
                    email: 'distributor@inventory.com',
                    name: 'Distributor',
                    role: 'distributor',
                    permissions: ['view_inventory', 'create_movement', 'approve_movement', 'receive_movement']
                };
                
                const mockToken = 'mock_jwt_token_' + Date.now();
                const mockRefreshToken = 'mock_refresh_token_' + Date.now();
                
                this.setAuth(mockToken, mockRefreshToken, mockUser);
                
                return {
                    success: true,
                    user: mockUser,
                    token: mockToken
                };
            }
            // Sales Agent login
            else if (email === 'agent@inventory.com' && password === 'agent123') {
                const mockUser = {
                    id: 4,
                    email: 'agent@inventory.com',
                    name: 'Sales Agent',
                    role: 'sales_agent',
                    permissions: ['view_inventory', 'create_movement', 'approve_movement', 'receive_movement']
                };
                
                const mockToken = 'mock_jwt_token_' + Date.now();
                const mockRefreshToken = 'mock_refresh_token_' + Date.now();
                
                this.setAuth(mockToken, mockRefreshToken, mockUser);
                
                return {
                    success: true,
                    user: mockUser,
                    token: mockToken
                };
            }
            // Store Manager login
            else if (email === 'store@inventory.com' && password === 'store123') {
                const mockUser = {
                    id: 5,
                    email: 'store@inventory.com',
                    name: 'Store Manager',
                    role: 'store_manager',
                    permissions: ['view_inventory', 'approve_movement', 'receive_movement']
                };
                
                const mockToken = 'mock_jwt_token_' + Date.now();
                const mockRefreshToken = 'mock_refresh_token_' + Date.now();
                
                this.setAuth(mockToken, mockRefreshToken, mockUser);
                
                return {
                    success: true,
                    user: mockUser,
                    token: mockToken
                };
            }
            else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    },
    
    // Logout function
    logout() {
        this.clearAuth();
        window.location.href = 'login.html';
    },
    
    // Refresh token
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            
            // Simulate API call - Replace with actual API endpoint
            // const response = await fetch('/api/auth/refresh', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ refreshToken })
            // });
            // const data = await response.json();
            
            // Mock refresh for now
            const user = this.getUser();
            if (user) {
                const newToken = 'mock_jwt_token_' + Date.now();
                localStorage.setItem(this.TOKEN_KEY, newToken);
                return { success: true, token: newToken };
            }
            
            throw new Error('Refresh failed');
        } catch (error) {
            this.logout();
            return { success: false, error: error.message };
        }
    },
    
    // Check if user has permission
    hasPermission(permission) {
        const user = this.getUser();
        if (!user) return false;
        
        // Super admin has all permissions
        if (user.role === 'super_admin' || user.permissions?.includes('all')) {
            return true;
        }
        
        return user.permissions?.includes(permission) || false;
    },
    
    // Check if user is admin
    isAdmin() {
        const user = this.getUser();
        return user?.role === 'super_admin' || user?.role === 'admin';
    },
    
    // Get authorization header for API calls
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Auto-refresh token logic (every 15 minutes)
let tokenRefreshInterval;

function startTokenRefresh() {
    // Clear existing interval
    if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
    }
    
    // Refresh token every 15 minutes
    tokenRefreshInterval = setInterval(async () => {
        if (Auth.isAuthenticated()) {
            await Auth.refreshToken();
        }
    }, 15 * 60 * 1000); // 15 minutes
}

// Start token refresh when authenticated
if (Auth.isAuthenticated()) {
    startTokenRefresh();
}

// Protected route wrapper
function requireAuth() {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Admin only route wrapper
function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!Auth.isAdmin()) {
        // Redirect to user's role-specific page
        const user = Auth.getUser();
        const rolePageMap = {
            'super_admin': 'admin.html',
            'warehouse_manager': 'warehouse.html',
            'distributor': 'distributor.html',
            'sales_agent': 'sales-agent.html',
            'store_manager': 'store.html'
        };
        const redirectPage = rolePageMap[user?.role] || 'warehouse.html';
        window.location.href = redirectPage;
        return false;
    }
    return true;
}

