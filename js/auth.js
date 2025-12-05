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
    
    // Login function - Now uses real API
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store authentication data
            this.setAuth(data.token, data.refreshToken, data.user);
            
            return {
                success: true,
                user: data.user,
                token: data.token
            };
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
    
    // Refresh token - Get current user info to refresh session
    async refreshToken() {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('No token');
            }
            
            // Use /api/auth/me to verify token is still valid
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update user data in case it changed
                if (data.user) {
                    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                }
                return { success: true, token: token };
            } else {
                throw new Error('Token expired');
            }
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

