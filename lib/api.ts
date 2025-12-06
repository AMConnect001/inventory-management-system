// API Utility Functions - Centralized API calls for Next.js pages
// Connects to Laravel backend at http://localhost:8000/api

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Get authentication token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('inventory_auth_token');
}

/**
 * Make an authenticated API request
 */
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle network errors
    if (!response.ok && response.status === 0) {
      throw new Error('Cannot connect to server. Please make sure the Laravel backend is running (php artisan serve)');
    }

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_refresh_token');
        localStorage.removeItem('inventory_user');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', error);
    // Provide helpful error message for network issues
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Cannot connect to server. Please make sure the Laravel backend is running. Run "php artisan serve" in the backend directory.');
    }
    throw error;
  }
}

export const API = {
  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getCurrentUser() {
    return request('/auth/me');
  },

  // ==================== PRODUCTS ====================

  async getProducts(filters?: { status?: string; category?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/products${query}`);
  },

  async getProduct(id: number) {
    return request(`/products/${id}`);
  },

  async createProduct(product: any) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: number, product: any) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: number) {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== INVENTORY ====================

  async getInventory(locationId?: number) {
    const query = locationId ? `?location_id=${locationId}` : '';
    return request(`/inventory${query}`);
  },

  async updateInventory(data: any) {
    return request('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addInitialStock(data: any) {
    return request('/inventory/initial-stock', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== MOVEMENTS ====================

  async getMovements(filters?: { status?: string; from_location_id?: number; to_location_id?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_location_id) params.append('from_location_id', filters.from_location_id.toString());
    if (filters?.to_location_id) params.append('to_location_id', filters.to_location_id.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/movements${query}`);
  },

  async getMovement(id: number) {
    return request(`/movements/${id}`);
  },

  async createMovement(movement: any) {
    return request('/movements', {
      method: 'POST',
      body: JSON.stringify(movement),
    });
  },

  async updateMovementStatus(id: number, status: string, action: string, description: string) {
    return request(`/movements/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, action, description }),
    });
  },

  // ==================== LOCATIONS ====================

  async getLocations(type?: string) {
    const query = type ? `?type=${type}` : '';
    return request(`/locations${query}`);
  },

  // ==================== USERS ====================

  async getUsers() {
    return request('/users');
  },

  async getUser(id: number) {
    return request(`/users/${id}`);
  },

  async createUser(user: any) {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateUser(id: number, user: any) {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  async deleteUser(id: number) {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // ==================== ACTIVITY LOGS ====================

  async getActivityLogs(limit: number = 100) {
    return request(`/activity-logs?limit=${limit}`);
  },

  // ==================== DASHBOARD ====================

  async getDashboardStats() {
    return request('/dashboard/stats');
  },
};

