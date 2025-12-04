// Reports & Analytics

function loadReports() {
    updateTotalValue();
    updateCategoryDistribution();
    updateMovementHistory();
    updateStockLevels();
}

function updateTotalValue() {
    const totalValue = inventory.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.unitPrice || 0));
    }, 0);
    
    const avgValue = inventory.length > 0 ? totalValue / inventory.length : 0;
    
    const totalValueEl = document.getElementById('totalValue');
    const avgValueEl = document.getElementById('avgValue');
    const dashboardTotalValueEl = document.getElementById('dashboardTotalValue');
    const dashboardAvgValueEl = document.getElementById('dashboardAvgValue');
    
    if (totalValueEl) totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    if (avgValueEl) avgValueEl.textContent = `$${avgValue.toFixed(2)}`;
    if (dashboardTotalValueEl) dashboardTotalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    if (dashboardAvgValueEl) dashboardAvgValueEl.textContent = `$${avgValue.toFixed(2)}`;
}

function updateCategoryDistribution() {
    const distribution = document.getElementById('categoryDistribution');
    if (!distribution) return;
    
    const categoryCounts = {};
    inventory.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
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

function updateMovementHistory() {
    const historyDiv = document.getElementById('movementHistory');
    if (!historyDiv) return;
    
    const recentMovements = movements.slice(-10).reverse();
    
    if (recentMovements.length === 0) {
        historyDiv.innerHTML = '<p class="text-muted">No movement history</p>';
        return;
    }
    
    historyDiv.innerHTML = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentMovements.map(movement => {
                        const fromLoc = locations.find(l => l.id === movement.fromLocationId);
                        const toLoc = locations.find(l => l.id === movement.toLocationId);
                        const statusClass = {
                            'pending': 'warning',
                            'dispatched': 'info',
                            'received': 'success',
                            'cancelled': 'danger'
                        }[movement.status] || 'secondary';
                        
                        return `
                            <tr>
                                <td>${formatDateTime(movement.createdAt)}</td>
                                <td>${fromLoc ? fromLoc.name : 'Unknown'}</td>
                                <td>${toLoc ? toLoc.name : 'Unknown'}</td>
                                <td><span class="badge bg-${statusClass}">${movement.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function updateStockLevels() {
    const stockLevelsDiv = document.getElementById('stockLevels');
    if (!stockLevelsDiv) return;
    
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    
    inventory.forEach(item => {
        if (item.quantity === 0) {
            outOfStock++;
        } else if (item.quantity <= (item.lowStockThreshold || 10)) {
            lowStock++;
        } else {
            inStock++;
        }
    });
    
    stockLevelsDiv.innerHTML = `
        <div class="row text-center">
            <div class="col-md-4">
                <div class="p-3">
                    <h3 class="text-success">${inStock}</h3>
                    <p class="mb-0">In Stock</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3">
                    <h3 class="text-warning">${lowStock}</h3>
                    <p class="mb-0">Low Stock</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="p-3">
                    <h3 class="text-danger">${outOfStock}</h3>
                    <p class="mb-0">Out of Stock</p>
                </div>
            </div>
        </div>
    `;
}

