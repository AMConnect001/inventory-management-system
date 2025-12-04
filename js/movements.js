// Stock Movements Management

function loadMovements() {
    // Update location filters first
    if (typeof updateLocationFilters === 'function') {
        updateLocationFilters();
    }
    
    // Filter movements by user location if applicable
    const userLocation = getUserLocation();
    let movementsToShow = movements;
    
    if (userLocation) {
        movementsToShow = movements.filter(m => 
            m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
        );
    }
    
    renderMovementsTable(movementsToShow);
    updateMovementsStats();
}

function renderMovementsTable(movementsList) {
    const tbody = document.getElementById('movementsTable');
    if (!tbody) return;
    
    if (movementsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No movements found.</td></tr>';
        return;
    }
    
    const userLocation = getUserLocation();
    
    tbody.innerHTML = movementsList.slice().reverse().map(movement => {
        const statusClass = {
            'pending': 'warning',
            'approved': 'info',
            'received': 'success',
            'cancelled': 'danger'
        }[movement.status] || 'secondary';
        
        // Show if this movement is relevant to current user
        const isRelevant = !userLocation || 
            movement.fromLocationId === userLocation.id || 
            movement.toLocationId === userLocation.id;
        
        if (!isRelevant && userLocation) {
            return ''; // Don't show movements not related to user's location
        }
        
        return `
            <tr onclick="viewMovementDetail(${movement.id})" style="cursor: pointer;">
                <td>#${movement.id}</td>
                <td>${formatDateTime(movement.createdAt)}</td>
                <td>${getLocationName(movement.fromLocationId)}</td>
                <td>${getLocationName(movement.toLocationId)}</td>
                <td>${movement.items?.length || 0} items</td>
                <td><span class="badge bg-${statusClass}">${movement.status}</span></td>
                <td>${movement.createdBy || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); viewMovementDetail(${movement.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).filter(row => row !== '').join('');
}

function getLocationName(locationId) {
    if (!locationId) return 'Unknown';
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown';
}

function viewMovementDetail(movementId) {
    const movement = movements.find(m => m.id === movementId);
    if (!movement) {
        alert('Movement not found');
        return;
    }
    
    // Store movement ID for detail view
    sessionStorage.setItem('viewMovementId', movementId);
    
    // Show movement detail section
    showMovementDetail();
    
    // Update URL hash
    window.location.hash = 'movement-detail';
}

function showMovementDetail() {
    const movementId = parseInt(sessionStorage.getItem('viewMovementId'));
    if (!movementId) return;
    
    const movement = movements.find(m => m.id === movementId);
    if (!movement) return;
    
    // Hide movements list, show detail
    const movementsSection = document.getElementById('stock-movements');
    if (movementsSection) {
        movementsSection.classList.add('d-none');
    }
    
    // Create or show detail section
    let detailSection = document.getElementById('movement-detail');
    if (!detailSection) {
        detailSection = document.createElement('section');
        detailSection.id = 'movement-detail';
        detailSection.className = 'content-section';
        document.querySelector('.content-area').appendChild(detailSection);
    }
    
    detailSection.classList.remove('d-none');
    detailSection.innerHTML = `
        <div class="mb-4">
            <button class="btn btn-secondary mb-3" onclick="backToMovements()">
                <i class="bi bi-arrow-left me-2"></i>Back to Movements
            </button>
            <h2>Movement #${movement.id}</h2>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Movement Details</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <strong>From Location:</strong>
                            <span class="ms-2">${getLocationName(movement.fromLocationId)}</span>
                        </div>
                        <div class="mb-3">
                            <strong>To Location:</strong>
                            <span class="ms-2">${getLocationName(movement.toLocationId)}</span>
                        </div>
                        <div class="mb-3">
                            <strong>Status:</strong>
                            <span class="badge bg-${getStatusClass(movement.status)} ms-2">${movement.status}</span>
                        </div>
                        <div class="mb-3">
                            <strong>Created:</strong>
                            <span class="ms-2">${formatDateTime(movement.createdAt)}</span>
                        </div>
                        <div class="mb-3">
                            <strong>Created By:</strong>
                            <span class="ms-2">${movement.createdBy || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Actions</h5>
                    </div>
                    <div class="card-body">
                        ${getMovementActions(movement)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Items</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movement.items?.map(item => {
                                const product = products.find(p => p.id === item.productId);
                                return `
                                    <tr>
                                        <td>${product ? product.name : 'Unknown Product'}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.unitPrice?.toFixed(2) || '0.00'}</td>
                                        <td>$${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</td>
                                    </tr>
                                `;
                            }).join('') || '<tr><td colspan="4" class="text-center text-muted">No items</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Activity Log</h5>
            </div>
            <div class="card-body">
                <div id="movementActivityLog">
                    ${renderActivityLog(movement.activities || [])}
                </div>
            </div>
        </div>
    `;
}

function renderActivityLog(activities) {
    if (activities.length === 0) {
        return '<p class="text-muted mb-0">No activity recorded</p>';
    }
    
    return activities.map(activity => `
        <div class="d-flex mb-3 pb-3 border-bottom">
            <div class="flex-shrink-0">
                <div class="activity-icon bg-${getActivityIconClass(activity.action)}">
                    <i class="bi ${getActivityIcon(activity.action)}"></i>
                </div>
            </div>
            <div class="flex-grow-1 ms-3">
                <strong>${activity.action}</strong>
                <p class="mb-1">${activity.description || ''}</p>
                <small class="text-muted">${formatDateTime(activity.timestamp)} by ${activity.user || 'System'}</small>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(action) {
    const icons = {
        'created': 'bi-plus-circle',
        'approved': 'bi-check-circle',
        'dispatched': 'bi-send',
        'received': 'bi-check-circle',
        'cancelled': 'bi-x-circle'
    };
    return icons[action.toLowerCase()] || 'bi-circle';
}

function getActivityIconClass(action) {
    const classes = {
        'created': 'primary',
        'approved': 'info',
        'dispatched': 'info',
        'received': 'success',
        'cancelled': 'danger'
    };
    return classes[action.toLowerCase()] || 'secondary';
}

function getStatusClass(status) {
    const classes = {
        'pending': 'warning',
        'approved': 'info',
        'received': 'success',
        'cancelled': 'danger'
    };
    return classes[status] || 'secondary';
}

// Helper function to get location name (if not already defined)
if (typeof getLocationName === 'undefined') {
    function getLocationName(locationId) {
        if (!locationId) return 'Unknown';
        const location = locations.find(l => l.id === locationId);
        return location ? location.name : 'Unknown';
    }
}

// Get available actions for a movement based on status and user role
function getMovementActions(movement) {
    const user = Auth.getUser();
    if (!user) return '<p class="text-muted mb-0">Please log in</p>';
    
    const userLocation = getUserLocation();
    const isReceiver = userLocation && userLocation.id === movement.toLocationId;
    const isSender = userLocation && userLocation.id === movement.fromLocationId;
    
    if (movement.status === 'pending') {
        // Receiver can approve, sender can cancel
        let actions = '';
        if (isReceiver) {
            actions += `
                <button class="btn btn-success w-100 mb-2" onclick="approveMovement(${movement.id})">
                    <i class="bi bi-check-circle me-2"></i>Approve Movement
                </button>
            `;
        }
        if (isSender) {
            actions += `
                <button class="btn btn-danger w-100" onclick="cancelMovement(${movement.id})">
                    <i class="bi bi-x-circle me-2"></i>Cancel
                </button>
            `;
        }
        if (!isReceiver && !isSender) {
            actions = '<p class="text-muted mb-0">No actions available for you</p>';
        }
        return actions || '<p class="text-muted mb-0">Waiting for approval</p>';
    } else if (movement.status === 'approved') {
        // Only receiver can confirm receipt
        if (isReceiver) {
            return `
                <button class="btn btn-primary w-100" onclick="receiveMovement(${movement.id})">
                    <i class="bi bi-check-circle me-2"></i>Confirm Receipt
                </button>
            `;
        }
        return '<p class="text-muted mb-0">Waiting for receiver to confirm</p>';
    } else if (movement.status === 'received') {
        return '<p class="text-success mb-0"><i class="bi bi-check-circle me-2"></i>Movement completed</p>';
    } else if (movement.status === 'cancelled') {
        return '<p class="text-danger mb-0"><i class="bi bi-x-circle me-2"></i>Movement cancelled</p>';
    }
    
    return '<p class="text-muted mb-0">No actions available</p>';
}

// Get user's location based on their role
function getUserLocation() {
    const user = Auth.getUser();
    if (!user) return null;
    
    // Find location that matches user's role
    return locations.find(loc => {
        // Map user roles to location roles
        const roleMapping = {
            'warehouse_manager': 'warehouse',
            'distributor': 'distributor',
            'sales_agent': 'sales_agent',
            'store_manager': 'store'
        };
        
        const expectedType = roleMapping[user.role];
        return expectedType && loc.type === expectedType;
    });
}

function backToMovements() {
    const detailSection = document.getElementById('movement-detail');
    if (detailSection) {
        detailSection.classList.add('d-none');
    }
    
    const movementsSection = document.getElementById('stock-movements');
    if (movementsSection) {
        movementsSection.classList.remove('d-none');
    }
    
    sessionStorage.removeItem('viewMovementId');
    window.location.hash = 'stock-movements';
}

// Approve movement (receiver approves - deducts from sender)
function approveMovement(movementId) {
    if (!confirm('Are you sure you want to approve this movement? This will deduct stock from the sender.')) return;
    
    const movement = movements.find(m => m.id === movementId);
    if (!movement) {
        alert('Movement not found');
        return;
    }
    
    // Check if movement is already approved or received
    if (movement.status === 'approved' || movement.status === 'received') {
        alert('This movement has already been processed.');
        return;
    }
    
    if (movement.status === 'cancelled') {
        alert('This movement has been cancelled and cannot be approved.');
        return;
    }
    
    // Check if user has permission to approve (must be receiver)
    const user = Auth.getUser();
    const toLocation = locations.find(l => l.id === movement.toLocationId);
    
    // Validate stock availability
    const stockValidation = validateMovementStock(movement.fromLocationId, movement.items);
    if (!stockValidation.valid) {
        const errorMsg = stockValidation.errors.map(e => 
            `${e.product}: Required ${e.required}, Available ${e.available}`
        ).join('\n');
        alert(`Insufficient stock:\n${errorMsg}`);
        return;
    }
    
    // Update status
    movement.status = 'approved';
    movement.approvedAt = new Date().toISOString();
    movement.approvedBy = user?.name || user?.email || 'System';
    
    // Deduct inventory from sender
    movement.items.forEach(item => {
        updateInventory(
            movement.fromLocationId,
            item.productId,
            -item.quantity,
            item.unitPrice
        );
    });
    
    // Add activity log
    if (!movement.activities) movement.activities = [];
    movement.activities.push({
        action: 'Approved',
        description: `Movement approved. Stock deducted from ${getLocationName(movement.fromLocationId)}`,
        timestamp: new Date().toISOString(),
        user: user?.name || 'System'
    });
    
    saveMovements();
    
    // Update dashboard stats
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
    if (typeof updateMovementsStats === 'function') {
        updateMovementsStats();
    }
    
    // Reload movements table
    if (typeof loadMovements === 'function') {
        loadMovements();
    }
    
    // Reload inventory if on inventory page
    if (typeof loadInventory === 'function') {
        loadInventory();
    }
    
    // Refresh movement detail view if open
    showMovementDetail();
    showNotification('Movement approved successfully! Stock deducted from sender.', 'success');
}

// Receive movement (receiver confirms receipt - adds to receiver inventory)
function receiveMovement(movementId) {
    if (!confirm('Are you sure you want to confirm receipt? This will add stock to your inventory.')) return;
    
    const movement = movements.find(m => m.id === movementId);
    if (!movement) {
        alert('Movement not found');
        return;
    }
    
    // Movement must be approved first
    if (movement.status !== 'approved') {
        alert('Movement must be approved before it can be received.');
        return;
    }
    
    // Check if already received
    if (movement.status === 'received') {
        alert('This movement has already been received.');
        return;
    }
    
    const user = Auth.getUser();
    
    // Update status
    movement.status = 'received';
    movement.receivedAt = new Date().toISOString();
    movement.receivedBy = user?.name || user?.email || 'System';
    
    // Add inventory to receiver
    movement.items.forEach(item => {
        updateInventory(
            movement.toLocationId,
            item.productId,
            item.quantity,
            item.unitPrice
        );
    });
    
    // Add activity log
    if (!movement.activities) movement.activities = [];
    movement.activities.push({
        action: 'Received',
        description: `Movement received. Stock added to ${getLocationName(movement.toLocationId)}`,
        timestamp: new Date().toISOString(),
        user: user?.name || 'System'
    });
    
    saveMovements();
    
    // Update dashboard stats
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
    if (typeof updateMovementsStats === 'function') {
        updateMovementsStats();
    }
    
    // Reload movements table
    if (typeof loadMovements === 'function') {
        loadMovements();
    }
    
    // Reload inventory if on inventory page
    if (typeof loadInventory === 'function') {
        loadInventory();
    }
    
    // Refresh movement detail view if open
    showMovementDetail();
    showNotification('Movement received successfully! Stock added to your inventory.', 'success');
}

// Legacy function - kept for compatibility, now calls approveMovement
function dispatchMovement(movementId) {
    approveMovement(movementId);
}

function cancelMovement(movementId) {
    if (!confirm('Are you sure you want to cancel this movement?')) return;
    
    const movement = movements.find(m => m.id === movementId);
    if (!movement) {
        alert('Movement not found');
        return;
    }
    
    // Can only cancel pending movements
    if (movement.status !== 'pending') {
        alert('Only pending movements can be cancelled.');
        return;
    }
    
    movement.status = 'cancelled';
    movement.cancelledAt = new Date().toISOString();
    
    if (!movement.activities) movement.activities = [];
    movement.activities.push({
        action: 'Cancelled',
        description: 'Movement has been cancelled',
        timestamp: new Date().toISOString(),
        user: Auth.getUser()?.name || 'System'
    });
    
    saveMovements();
    
    // Update dashboard stats
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
    if (typeof updateMovementsStats === 'function') {
        updateMovementsStats();
    }
    
    // Reload movements table
    if (typeof loadMovements === 'function') {
        loadMovements();
    }
    
    // Refresh movement detail view if open
    showMovementDetail();
    showNotification('Movement cancelled successfully!', 'success');
}

function updateMovementsStats() {
    const userLocation = getUserLocation();
    let relevantMovements = movements;
    
    // Filter movements relevant to user's location
    if (userLocation) {
        relevantMovements = movements.filter(m => 
            m.fromLocationId === userLocation.id || m.toLocationId === userLocation.id
        );
    }
    
    const pendingMovements = relevantMovements.filter(m => m.status === 'pending').length;
    const pendingEl = document.getElementById('pendingMovements');
    if (pendingEl) pendingEl.textContent = pendingMovements;
}

function saveMovements() {
    localStorage.setItem('movements', JSON.stringify(movements));
}

function filterMovements() {
    const statusFilter = document.getElementById('movementStatusFilter')?.value || '';
    const fromLocationFilter = document.getElementById('movementFromFilter')?.value || '';
    const toLocationFilter = document.getElementById('movementToFilter')?.value || '';
    
    let filtered = movements.filter(movement => {
        const matchesStatus = !statusFilter || movement.status === statusFilter;
        const matchesFrom = !fromLocationFilter || movement.fromLocationId === parseInt(fromLocationFilter);
        const matchesTo = !toLocationFilter || movement.toLocationId === parseInt(toLocationFilter);
        
        return matchesStatus && matchesFrom && matchesTo;
    });
    
    renderMovementsTable(filtered);
}

