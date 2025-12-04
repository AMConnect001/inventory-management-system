// Activity Log

function loadActivityLog() {
    // Combine activities from movements and transactions
    let allActivities = [];
    
    // Get activities from movements
    movements.forEach(movement => {
        if (movement.activities) {
            movement.activities.forEach(activity => {
                allActivities.push({
                    ...activity,
                    type: 'movement',
                    movementId: movement.id
                });
            });
        }
    });
    
    // Get activities from transactions
    transactions.forEach(transaction => {
        allActivities.push({
            action: transaction.type === 'in' ? 'Stock In' : 'Stock Out',
            description: `${transaction.type === 'in' ? 'Added' : 'Removed'} ${transaction.quantity} units of ${transaction.itemName}`,
            timestamp: transaction.date,
            user: 'System',
            type: 'transaction',
            transactionId: transaction.id
        });
    });
    
    // Sort by timestamp (newest first)
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    renderActivityLog(allActivities);
}

function renderActivityLog(activities) {
    const tbody = document.getElementById('activityLogTable');
    if (!tbody) return;
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No activity recorded</td></tr>';
        return;
    }
    
    tbody.innerHTML = activities.map(activity => {
        const iconClass = getActivityIconClass(activity.action);
        const icon = getActivityIcon(activity.action);
        
        return `
            <tr>
                <td>${formatDateTime(activity.timestamp)}</td>
                <td>
                    <span class="badge bg-${iconClass}">
                        <i class="bi ${icon} me-1"></i>${activity.action}
                    </span>
                </td>
                <td>${activity.description || '-'}</td>
                <td>${activity.user || 'System'}</td>
                <td>
                    ${activity.type === 'movement' ? `
                        <button class="btn btn-sm btn-primary" onclick="viewMovementDetail(${activity.movementId})">
                            <i class="bi bi-eye"></i>
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function getActivityIcon(action) {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('add')) return 'bi-plus-circle';
    if (actionLower.includes('dispatched') || actionLower.includes('send')) return 'bi-send';
    if (actionLower.includes('received') || actionLower.includes('receive')) return 'bi-check-circle';
    if (actionLower.includes('cancelled') || actionLower.includes('cancel')) return 'bi-x-circle';
    if (actionLower.includes('stock in') || actionLower.includes('in')) return 'bi-box-arrow-in-down';
    if (actionLower.includes('stock out') || actionLower.includes('out')) return 'bi-box-arrow-up';
    return 'bi-circle';
}

function getActivityIconClass(action) {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('add')) return 'primary';
    if (actionLower.includes('dispatched') || actionLower.includes('send')) return 'info';
    if (actionLower.includes('received') || actionLower.includes('receive') || actionLower.includes('stock in')) return 'success';
    if (actionLower.includes('cancelled') || actionLower.includes('cancel')) return 'danger';
    if (actionLower.includes('stock out')) return 'warning';
    return 'secondary';
}

