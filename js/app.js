// Inventory Stock Flow - Frontend JavaScript

// Data Storage - Now loaded from API
let inventory = [];
let transactions = []; // Transactions are now tracked via activity logs
let products = [];
let locations = [];
let movements = [];
let users = [];

// Location hierarchy mapping
const LOCATION_HIERARCHY = {
    'warehouse': ['distributor'],
    'distributor': ['sales_agent'],
    'sales_agent': ['store'],
    'store': [] // Stores cannot send to anyone
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
    }
    
    initializeApp();
});

async function initializeApp() {
    // Set up navigation
    setupNavigation();
    
    // Set up logout
    setupLogout();
    
    // Load user info in sidebar
    loadUserInfo();
    
    // Set up role-based UI
    setupRoleBasedUI();
    
    // Load all data from API first
    await loadAllData();
    
    // Load initial data based on current section
    const currentSection = getCurrentSection();
    loadSectionData(currentSection);
    
    // Set up event listeners
    setupEventListeners();
    
    // Update item dropdowns
    updateItemDropdowns();
    
    // Start token refresh
    if (typeof startTokenRefresh === 'function') {
        startTokenRefresh();
    }
}

// Load all data from API
async function loadAllData() {
    try {
        // Load products
        if (typeof API !== 'undefined') {
            const productsData = await API.getProducts();
            products = productsData.products || [];
            
            // Load locations
            const locationsData = await API.getLocations();
            locations = locationsData.locations || [];
            
            // Load inventory
            const inventoryData = await API.getInventory();
            inventory = inventoryData.inventory || [];
            
            // Load movements
            const movementsData = await API.getMovements();
            movements = movementsData.movements || [];
            
            // Load users (admin only)
            if (typeof Auth !== 'undefined' && Auth.isAdmin()) {
                try {
                    const usersData = await API.getUsers();
                    users = usersData.users || [];
                } catch (error) {
                    console.warn('Could not load users:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data. Please refresh the page.', 'error');
    }
}

function setupRoleBasedUI() {
    const user = Auth.getUser();
    if (!user) return;
    
    const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
    
    // Show/hide initial stock button for warehouse managers
    const addInitialStockBtn = document.getElementById('addInitialStockBtn');
    if (addInitialStockBtn) {
        if (userLocation && userLocation.type === 'warehouse') {
            addInitialStockBtn.style.display = 'inline-block';
        } else {
            addInitialStockBtn.style.display = 'none';
        }
    }
    
    // Update role info in dashboard
    updateRoleInfo();
}

function updateRoleInfo() {
    const user = Auth.getUser();
    if (!user) return;
    
    const roleBadge = document.querySelector('.role-badge');
    if (roleBadge) {
        const roleText = user.role.replace('_', ' ').split(' ').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        roleBadge.textContent = roleText;
    }
    
    const emailDisplay = document.querySelector('.role-value');
    if (emailDisplay) {
        emailDisplay.textContent = user.email;
    }
}

function getCurrentSection() {
    const hash = window.location.hash.substring(1);
    if (hash) return hash;
    
    // Check active nav link
    const activeLink = document.querySelector('.sidebar-nav .nav-link.active');
    if (activeLink) {
        return activeLink.getAttribute('data-section') || 'dashboard';
    }
    
    return 'dashboard';
}

function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'stock-movements':
        case 'movements':
            if (typeof loadMovements === 'function') {
                loadMovements();
                updateLocationFilters();
            } else {
                loadTransactions();
            }
            break;
        case 'new-transfer':
            // Wizard will be opened manually
            break;
        case 'activity-log':
            if (typeof loadActivityLog === 'function') {
                loadActivityLog();
            }
            break;
        case 'users':
            if (typeof requireAdmin === 'function') requireAdmin();
            if (typeof loadUsers === 'function') {
                loadUsers();
            }
            break;
        case 'reports':
            if (typeof loadReports === 'function') {
                loadReports();
            }
            break;
        default:
            loadDashboard();
    }
}

function loadUserInfo() {
    if (typeof Auth !== 'undefined' && Auth.getUser()) {
        const user = Auth.getUser();
        const userInfo = document.querySelector('.logo-text small');
        if (userInfo) {
            userInfo.textContent = user.name || user.email;
        }
    }
}

function updateLocationFilters() {
    const fromFilter = document.getElementById('movementFromFilter');
    const toFilter = document.getElementById('movementToFilter');
    
    if (fromFilter) {
        const currentValue = fromFilter.value;
        fromFilter.innerHTML = '<option value="">All From Locations</option>' +
            locations.map(loc => `<option value="${loc.id}">${loc.name}</option>`).join('');
        fromFilter.value = currentValue;
    }
    
    if (toFilter) {
        const currentValue = toFilter.value;
        toFilter.innerHTML = '<option value="">All To Locations</option>' +
            locations.map(loc => `<option value="${loc.id}">${loc.name}</option>`).join('');
        toFilter.value = currentValue;
    }
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Update URL hash
                window.location.hash = sectionId;
                
                // Load section data
                loadSectionData(sectionId);
            }
        });
    });
    
    // Handle hash change
    window.addEventListener('hashchange', function() {
        const sectionId = getCurrentSection();
        showSection(sectionId);
        loadSectionData(sectionId);
        
        // Update active nav link
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Show dashboard by default or based on hash
    const sectionId = getCurrentSection();
    showSection(sectionId);
    
    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Add logout functionality
function setupLogout() {
    const signOutLink = document.querySelector('.sign-out-link');
    if (signOutLink) {
        signOutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to sign out?')) {
                if (typeof Auth !== 'undefined') {
                    Auth.logout();
                } else {
                    window.location.href = 'login.html';
                }
            }
        });
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.add('d-none');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterInventory);
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterInventory);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInventory);
    }
    
    // Stock In item selection
    const stockInItem = document.getElementById('stockInItem');
    if (stockInItem) {
        stockInItem.addEventListener('change', function() {
            const selectedItem = inventory.find(item => item.id === parseInt(this.value));
            if (selectedItem) {
                document.getElementById('stockInPrice').value = selectedItem.unitPrice || '';
            }
        });
    }
    
    // Stock Out item selection
    const stockOutItem = document.getElementById('stockOutItem');
    if (stockOutItem) {
        stockOutItem.addEventListener('change', function() {
            const selectedItem = inventory.find(item => item.id === parseInt(this.value));
            if (selectedItem) {
                document.getElementById('availableQuantity').value = selectedItem.quantity || 0;
                document.getElementById('stockOutQuantity').max = selectedItem.quantity || 0;
            }
        });
    }
    
    // Modal reset on close
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function() {
            const forms = this.querySelectorAll('form');
            forms.forEach(form => form.reset());
        });
    });
}

// Dashboard Functions
function loadDashboard() {
    updateDashboardStats();
    loadRecentTransactions();
    // Load new dashboard features
    updateCurrentDateTime();
    updateUserProfile();
    loadHighestQuantityProducts();
    loadLatestMovements();
    loadRecentlyAddedProducts();
    loadDailyMovements();
    // Also update reports data for dashboard
    if (typeof loadReports === 'function') {
        loadReports();
    }
}

function updateDashboardStats() {
    const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
    
    // Total Products
    const totalProducts = products.length || 0;
    const totalItemsEl = document.getElementById('totalItems');
    if (totalItemsEl) totalItemsEl.textContent = totalProducts;
    
    // Total Inventory (location-specific if user has a location)
    let totalInventory = 0;
    if (userLocation && typeof getLocationInventory === 'function') {
        const locationInv = getLocationInventory(userLocation.id);
        totalInventory = locationInv.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } else {
        inventory.forEach(item => {
            totalInventory += item.quantity || 0;
        });
    }
    const totalInventoryEl = document.getElementById('totalInventory');
    if (totalInventoryEl) totalInventoryEl.textContent = totalInventory;
    
    // Pending Movements (filtered by user location)
    let pendingMovements = movements.filter(m => m.status === 'pending');
    if (userLocation) {
        pendingMovements = pendingMovements.filter(m => 
            m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
        );
    }
    const pendingMovementsEl = document.getElementById('pendingMovements');
    if (pendingMovementsEl) pendingMovementsEl.textContent = pendingMovements.length;
    
    // Activity Logs (combine movements and transactions)
    let activityLogs = transactions.length;
    let relevantMovements = movements;
    if (userLocation) {
        relevantMovements = movements.filter(m => 
            m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
        );
    }
    relevantMovements.forEach(movement => {
        if (movement.activities) {
            activityLogs += movement.activities.length;
        }
    });
    const activityLogsEl = document.getElementById('activityLogs');
    if (activityLogsEl) activityLogsEl.textContent = activityLogs;
}

function loadRecentTransactions() {
    const tbody = document.getElementById('recentTransactions');
    if (!tbody) return;
    
    const recent = transactions.slice(-5).reverse();
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No transactions yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = recent.map(transaction => {
        const statusClass = transaction.type === 'in' ? 'success' : 'warning';
        const statusText = transaction.type === 'in' ? 'IN' : 'OUT';
        return `
            <tr>
                <td>${formatDateTime(transaction.date)}</td>
                <td>${transaction.itemName}</td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                <td>${transaction.quantity}</td>
                <td><span class="badge bg-${statusClass}">Completed</span></td>
            </tr>
        `;
    }).join('');
}

// Inventory Functions
async function loadInventory() {
    try {
        // Reload inventory from API
        if (typeof API !== 'undefined') {
            const inventoryData = await API.getInventory();
            inventory = inventoryData.inventory || [];
        }
        
        updateCategoryFilter();
        
        // Filter inventory by user's location if applicable
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        let displayInventory = inventory;
        
        if (userLocation) {
            displayInventory = inventory.filter(inv => 
                (inv.locationId === userLocation.id || inv.location_id === userLocation.id)
            );
        }
        
        renderInventoryTable(displayInventory);
    } catch (error) {
        console.error('Error loading inventory:', error);
        showNotification('Error loading inventory: ' + error.message, 'error');
    }
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Get categories from both inventory items and products
    const categories = new Set();
    
    // From inventory items
    inventory.forEach(item => {
        if (item.category) categories.add(item.category);
    });
    
    // From products (for items that reference products)
    inventory.forEach(item => {
        if (item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product && product.category) {
                categories.add(product.category);
            }
        }
    });
    
    const categoryArray = Array.from(categories).sort();
    const currentValue = categoryFilter.value;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categoryArray.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    categoryFilter.value = currentValue;
}

function renderInventoryTable(items) {
    const tbody = document.getElementById('inventoryTable');
    if (!tbody) return;
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No items found. Add your first item!</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => {
        const status = getItemStatus(item);
        const statusClass = status === 'in-stock' ? 'status-in-stock' : 
                          status === 'low-stock' ? 'status-low-stock' : 'status-out-of-stock';
        const statusText = status === 'in-stock' ? 'In Stock' : 
                          status === 'low-stock' ? 'Low Stock' : 'Out of Stock';
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || item.unit_price || 0;
        const totalValue = (quantity * unitPrice).toFixed(2);
        
        // Get product name (from productId if available, otherwise use item.name)
        const productId = item.productId || item.product_id;
        const product = productId ? products.find(p => p.id === productId) : null;
        const productName = product ? product.name : (item.product_name || item.productName || item.name || 'Unknown');
        const locationId = item.locationId || item.location_id;
        const locationName = locationId ? getLocationName(locationId) : (item.location_name || 'Unknown');
        
        return `
            <tr>
                <td>#${item.id}</td>
                <td><strong>${productName}</strong></td>
                <td>${item.category || product?.category || '-'}</td>
                <td>${quantity}</td>
                <td>$${unitPrice.toFixed(2)}</td>
                <td>$${totalValue}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${locationId ? `<small class="text-muted">${locationName}</small>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function getLocationName(locationId) {
    if (!locationId) return 'Unknown';
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown';
}

function getItemStatus(item) {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= (item.lowStockThreshold || 10)) return 'low-stock';
    return 'in-stock';
}

function filterInventory() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (!searchInput || !categoryFilter || !statusFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;
    
    // Filter by user's location if applicable
    const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
    let baseInventory = inventory;
    if (userLocation) {
        baseInventory = inventory.filter(inv => inv.locationId === userLocation.id);
    }
    
    let filtered = baseInventory.filter(item => {
        // Get product info for search
        const product = item.productId ? products.find(p => p.id === item.productId) : null;
        const productName = product ? product.name : (item.productName || item.name || '');
        const itemCategory = item.category || product?.category || '';
        
        // Search matching
        const matchesSearch = !searchTerm || 
            productName.toLowerCase().includes(searchTerm) ||
            itemCategory.toLowerCase().includes(searchTerm);
        
        // Category matching
        const matchesCategory = !categoryValue || itemCategory === categoryValue;
        
        // Status matching
        const matchesStatus = !statusValue || getItemStatus(item) === statusValue;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderInventoryTable(filtered);
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    // Reload inventory with location filter
    loadInventory();
}

// Add Item
function addItem() {
    const form = document.getElementById('addItemForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newItem = {
        id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
        name: document.getElementById('itemName').value.trim(),
        category: document.getElementById('itemCategory').value.trim(),
        quantity: parseInt(document.getElementById('itemQuantity').value),
        unitPrice: parseFloat(document.getElementById('itemPrice').value),
        lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value) || 10,
        description: document.getElementById('itemDescription').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    inventory.push(newItem);
    saveInventory();
    
    // Create initial transaction
    addTransaction('in', newItem.id, newItem.name, newItem.quantity, newItem.unitPrice, 'Initial stock');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
    modal.hide();
    
    // Refresh displays
    loadDashboard();
    loadInventory();
    loadReports();
    updateItemDropdowns();
    
    showNotification('Item added successfully!', 'success');
}

// Edit Item
function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemCategory').value = item.category;
    document.getElementById('editItemPrice').value = item.unitPrice;
    document.getElementById('editLowStockThreshold').value = item.lowStockThreshold || 10;
    document.getElementById('editItemDescription').value = item.description || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
    modal.show();
}

function updateItem() {
    const form = document.getElementById('editItemForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = parseInt(document.getElementById('editItemId').value);
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    
    item.name = document.getElementById('editItemName').value.trim();
    item.category = document.getElementById('editItemCategory').value.trim();
    item.unitPrice = parseFloat(document.getElementById('editItemPrice').value);
    item.lowStockThreshold = parseInt(document.getElementById('editLowStockThreshold').value) || 10;
    item.description = document.getElementById('editItemDescription').value.trim();
    
    saveInventory();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editItemModal'));
    modal.hide();
    
    loadDashboard();
    loadInventory();
    loadReports();
    updateItemDropdowns();
    
    showNotification('Item updated successfully!', 'success');
}

// Delete Item
function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    inventory = inventory.filter(item => item.id !== id);
    saveInventory();
    
    loadDashboard();
    loadInventory();
    loadReports();
    updateItemDropdowns();
    
    showNotification('Item deleted successfully!', 'success');
}

// Stock In
function stockIn() {
    const form = document.getElementById('stockInForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const itemId = parseInt(document.getElementById('stockInItem').value);
    const quantity = parseInt(document.getElementById('stockInQuantity').value);
    const price = parseFloat(document.getElementById('stockInPrice').value) || 0;
    const notes = document.getElementById('stockInNotes').value.trim();
    
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    // Update quantity
    item.quantity += quantity;
    
    // Update price if provided
    if (price > 0) {
        item.unitPrice = price;
    }
    
    saveInventory();
    
    // Add transaction
    addTransaction('in', itemId, item.name, quantity, price || item.unitPrice, notes);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('stockInModal'));
    modal.hide();
    
    loadDashboard();
    loadInventory();
    loadTransactions();
    loadReports();
    
    showNotification('Stock added successfully!', 'success');
}

// Stock Out
function stockOut() {
    const form = document.getElementById('stockOutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const itemId = parseInt(document.getElementById('stockOutItem').value);
    const quantity = parseInt(document.getElementById('stockOutQuantity').value);
    const notes = document.getElementById('stockOutNotes').value.trim();
    
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    if (quantity > item.quantity) {
        alert('Insufficient stock!');
        return;
    }
    
    // Update quantity
    item.quantity -= quantity;
    
    saveInventory();
    
    // Add transaction
    addTransaction('out', itemId, item.name, quantity, item.unitPrice, notes);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('stockOutModal'));
    modal.hide();
    
    loadDashboard();
    loadInventory();
    loadTransactions();
    loadReports();
    
    showNotification('Stock removed successfully!', 'success');
}

// Transactions
function loadTransactions() {
    const tbody = document.getElementById('transactionsTable');
    const stockMovementsTbody = document.getElementById('stockMovementsTable');
    
    const renderTable = (targetTbody) => {
        if (!targetTbody) return;
        
        if (transactions.length === 0) {
            targetTbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No transactions yet</td></tr>';
            return;
        }
        
        targetTbody.innerHTML = transactions.slice().reverse().map(transaction => {
            const typeClass = transaction.type === 'in' ? 'success' : 'warning';
            const typeText = transaction.type === 'in' ? 'IN' : 'OUT';
            const totalValue = (transaction.quantity * transaction.unitPrice).toFixed(2);
            
            return `
                <tr>
                    <td>${formatDateTime(transaction.date)}</td>
                    <td>${transaction.itemName}</td>
                    <td><span class="badge bg-${typeClass}">${typeText}</span></td>
                    <td>${transaction.quantity}</td>
                    <td>$${transaction.unitPrice.toFixed(2)}</td>
                    <td>$${totalValue}</td>
                    <td>${transaction.notes || '-'}</td>
                </tr>
            `;
        }).join('');
    };
    
    renderTable(tbody);
    renderTable(stockMovementsTbody);
}

function addTransaction(type, itemId, itemName, quantity, unitPrice, notes) {
    const transaction = {
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        type: type,
        itemId: itemId,
        itemName: itemName,
        quantity: quantity,
        unitPrice: unitPrice,
        notes: notes,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveTransactions();
}

// Reports
function loadReports() {
    updateTotalValue();
    updateCategoryDistribution();
}

function updateTotalValue() {
    const totalValue = inventory.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    const avgValue = inventory.length > 0 ? totalValue / inventory.length : 0;
    
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('avgValue').textContent = `$${avgValue.toFixed(2)}`;
}

function updateCategoryDistribution() {
    const distribution = document.getElementById('categoryDistribution');
    if (!distribution) return;
    
    const categoryCounts = {};
    inventory.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    
    if (Object.keys(categoryCounts).length === 0) {
        distribution.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }
    
    distribution.innerHTML = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => {
            const percentage = ((count / inventory.length) * 100).toFixed(1);
            return `
                <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                        <span>${category}</span>
                        <span><strong>${count}</strong> (${percentage}%)</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar" role="progressbar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
}

// Utility Functions
function updateItemDropdowns() {
    const stockInItem = document.getElementById('stockInItem');
    const stockOutItem = document.getElementById('stockOutItem');
    
    if (stockInItem) {
        const currentValue = stockInItem.value;
        stockInItem.innerHTML = '<option value="">Choose an item...</option>' +
            inventory.map(item => `<option value="${item.id}">${item.name} (${item.quantity} in stock)</option>`).join('');
        stockInItem.value = currentValue;
    }
    
    if (stockOutItem) {
        const currentValue = stockOutItem.value;
        stockOutItem.innerHTML = '<option value="">Choose an item...</option>' +
            inventory.filter(item => item.quantity > 0)
                .map(item => `<option value="${item.id}">${item.name} (${item.quantity} available)</option>`).join('');
        stockOutItem.value = currentValue;
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Inventory is now saved via API, no need for localStorage
function saveInventory() {
    // This function is kept for compatibility but does nothing
    // Inventory is saved through API calls
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function exportData() {
    const data = {
        inventory: inventory,
        transactions: transactions,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function showNotification(message, type = 'info') {
    // Create toast notification
    const toastContainer = getOrCreateToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="toast-header bg-${type} text-white">
                <i class="bi ${getNotificationIcon(type)} me-2"></i>
                <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getOrCreateToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    return container;
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'bi-check-circle-fill',
        'error': 'bi-x-circle-fill',
        'danger': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
}

// Dashboard Enhancement Functions

function updateCurrentDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    };
    const dateTimeStr = now.toLocaleDateString('en-US', options);
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.textContent = dateTimeStr;
    }
}

function updateUserProfile() {
    const user = Auth.getUser();
    if (user) {
        const nameEl = document.getElementById('userNameDisplay');
        const emailEl = document.getElementById('userEmailDisplay');
        if (nameEl) {
            // Get role display name
            const roleDisplayNames = {
                'super_admin': 'Super Admin',
                'warehouse_manager': 'Warehouse Manager',
                'distributor': 'Distributor Manager',
                'sales_agent': 'Sales Agent',
                'store_manager': 'Store Manager'
            };
            const defaultName = roleDisplayNames[user.role] || 'User';
            nameEl.textContent = user.name || defaultName;
        }
        if (emailEl) {
            emailEl.textContent = user.email || 'user@inventory.com';
        }
    }
}

function loadHighestQuantityProducts() {
    const tbody = document.getElementById('highestQuantityProductsTable');
    if (!tbody) return;

    try {
        // Filter by user location if applicable
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        let filteredInventory = inventory;
        let filteredMovements = movements;
        
        if (userLocation) {
            // Filter inventory by user's location
            filteredInventory = inventory.filter(inv => {
                const locationId = inv.location_id || inv.locationId;
                return locationId === userLocation.id;
            });
            
            // Filter movements relevant to user's location
            filteredMovements = movements.filter(m => 
                m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
            );
        }
        
        // Group inventory by product and calculate totals
        const productStats = {};
        
        filteredInventory.forEach(item => {
            const productId = item.product_id || item.productId;
            const productName = item.product_name || item.productName || 'Unknown';
            const quantity = item.quantity || 0;
            
            if (!productStats[productId]) {
                productStats[productId] = {
                    name: productName,
                    totalQuantity: 0,
                    movementCount: 0
                };
            }
            productStats[productId].totalQuantity += quantity;
        });

        // Count movements per product
        filteredMovements.forEach(movement => {
            if (movement.items && Array.isArray(movement.items)) {
                movement.items.forEach(item => {
                    const productId = item.product_id || item.productId;
                    if (productStats[productId]) {
                        productStats[productId].movementCount++;
                    }
                });
            }
        });

        // Convert to array and sort by quantity
        const sortedProducts = Object.values(productStats)
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 3);

        if (sortedProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = sortedProducts.map((product, index) => `
            <tr>
                <td>${product.name}</td>
                <td>${product.movementCount}</td>
                <td>${product.totalQuantity}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading highest quantity products:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading data</td></tr>';
    }
}

function loadLatestMovements() {
    const tbody = document.getElementById('latestMovementsTable');
    if (!tbody) return;

    try {
        // Filter by user location if applicable
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        let filteredMovements = movements;
        
        if (userLocation) {
            // Filter movements relevant to user's location
            filteredMovements = movements.filter(m => 
                m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
            );
        }
        
        // Get latest movements with their items
        const latestMovements = filteredMovements
            .sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                return dateB - dateA;
            })
            .slice(0, 3);

        if (latestMovements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No movements found</td></tr>';
            return;
        }

        tbody.innerHTML = latestMovements.map((movement, index) => {
            // Calculate total value from items
            let totalValue = 0;
            if (movement.items && Array.isArray(movement.items)) {
                totalValue = movement.items.reduce((sum, item) => {
                    return sum + ((item.quantity || 0) * (item.unit_price || item.unitPrice || 0));
                }, 0);
            }
            
            // Get first product name or use location names
            let productName = 'Multiple Products';
            if (movement.items && movement.items.length > 0) {
                const firstItem = movement.items[0];
                const productId = firstItem.product_id || firstItem.productId;
                const product = products.find(p => p.id === productId);
                if (product) {
                    productName = product.name;
                    if (movement.items.length > 1) {
                        productName += ` +${movement.items.length - 1} more`;
                    }
                }
            }
            
            const dateStr = movement.created_at || movement.createdAt;
            const formattedDate = dateStr ? formatDate(dateStr) : 'N/A';
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${productName}</td>
                    <td>${formattedDate}</td>
                    <td>$${totalValue.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading latest movements:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data</td></tr>';
    }
}

function loadRecentlyAddedProducts() {
    const container = document.getElementById('recentlyAddedProductsList');
    if (!container) return;

    try {
        // Get recently added products (sorted by creation date)
        const recentProducts = products
            .sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                return dateB - dateA;
            })
            .slice(0, 2);

        if (recentProducts.length === 0) {
            container.innerHTML = '<p class="text-muted mb-0">No products found</p>';
            return;
        }

        container.innerHTML = recentProducts.map(product => {
            const price = product.unit_price || product.unitPrice || 0;
            const category = product.category || 'Uncategorized';
            return `
                <div class="mb-3 pb-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${product.name}</h6>
                            <p class="mb-0 text-muted small">Price: $${price.toFixed(2)}</p>
                        </div>
                        <span class="badge bg-secondary">${category}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading recently added products:', error);
        container.innerHTML = '<p class="text-danger mb-0">Error loading data</p>';
    }
}

function loadDailyMovements() {
    const tbody = document.getElementById('dailyMovementsTable');
    if (!tbody) return;

    try {
        // Filter by user location if applicable
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        let filteredMovements = movements;
        
        if (userLocation) {
            // Filter movements relevant to user's location
            filteredMovements = movements.filter(m => 
                m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
            );
        }
        
        // Get all movements and flatten items
        const movementItems = [];
        
        filteredMovements.forEach(movement => {
            if (movement.items && Array.isArray(movement.items)) {
                movement.items.forEach(item => {
                    const productId = item.product_id || item.productId;
                    const product = products.find(p => p.id === productId);
                    const productName = product ? product.name : 'Unknown Product';
                    const quantity = item.quantity || 0;
                    const unitPrice = item.unit_price || item.unitPrice || 0;
                    const total = quantity * unitPrice;
                    const dateStr = movement.created_at || movement.createdAt;
                    
                    movementItems.push({
                        productName,
                        quantity,
                        total,
                        date: dateStr
                    });
                });
            }
        });

        // Sort by date (most recent first) and limit to 8
        const sortedItems = movementItems
            .sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            })
            .slice(0, 8);

        if (sortedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No movements found</td></tr>';
            return;
        }

        tbody.innerHTML = sortedItems.map((item, index) => {
            const formattedDate = item.date ? formatDate(item.date) : 'N/A';
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.total.toFixed(2)}</td>
                    <td>${formattedDate}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading daily movements:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

