// Activity Log

async function loadActivityLog() {
    try {
        let allActivities = [];
        
        // Load activity logs from API
        if (typeof API !== 'undefined') {
            const logsData = await API.getActivityLogs(200);
            const apiLogs = logsData.logs || [];
            
            // Transform API logs to match expected format
            allActivities = apiLogs.map(log => ({
                action: log.action,
                description: log.description,
                timestamp: log.created_at,
                user: log.user_name || log.user_email || 'System',
                type: log.entity_type || 'general',
                entityId: log.entity_id,
                movementId: log.entity_type === 'movement' ? log.entity_id : null
            }));
        }
        
        // Sort by timestamp (newest first)
        allActivities.sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
        
        renderActivityLog(allActivities);
    } catch (error) {
        console.error('Error loading activity log:', error);
        showNotification('Error loading activity log: ' + error.message, 'error');
    }
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
                <td>${formatDateTime(activity.timestamp || activity.created_at)}</td>
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

