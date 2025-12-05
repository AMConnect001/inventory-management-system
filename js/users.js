// Users Management (Admin Only)

async function loadUsers() {
    if (typeof requireAdmin === 'function' && !requireAdmin()) {
        return;
    }
    
    try {
        if (typeof API !== 'undefined') {
            const usersData = await API.getUsers();
            users = usersData.users || [];
        }
        renderUsersTable(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users: ' + error.message, 'error');
    }
}

function renderUsersTable(usersList) {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;
    
    if (usersList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No users found. Add your first user!</td></tr>';
        return;
    }
    
    tbody.innerHTML = usersList.map(user => {
        const roleBadge = user.role === 'super_admin' ? 'danger' : 
                         user.role === 'admin' ? 'warning' : 'info';
        return `
            <tr>
                <td>#${user.id}</td>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><span class="badge bg-${roleBadge}">${user.role}</span></td>
                <td>${user.status || 'active'}</td>
                <td>
                    <button class="btn btn-sm btn-edit action-btn" onclick="editUser(${user.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-delete action-btn" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function addUser() {
    const form = document.getElementById('addUserForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const password = document.getElementById('userPassword')?.value;
    if (!password) {
        alert('Password is required');
        return;
    }
    
    const newUser = {
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        password: password,
        role: document.getElementById('userRole').value,
        location_id: document.getElementById('userLocationId')?.value ? parseInt(document.getElementById('userLocationId').value) : null
    };
    
    try {
        await API.createUser(newUser);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        await loadUsers();
        showNotification('User added successfully!', 'success');
    } catch (error) {
        console.error('Error adding user:', error);
        showNotification('Error adding user: ' + error.message, 'error');
    }
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').value = user.status || 'active';
    
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

async function updateUser() {
    const form = document.getElementById('editUserForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = parseInt(document.getElementById('editUserId').value);
    
    const updatedUser = {
        name: document.getElementById('editUserName').value.trim(),
        email: document.getElementById('editUserEmail').value.trim(),
        role: document.getElementById('editUserRole').value,
        location_id: document.getElementById('editUserLocationId')?.value ? parseInt(document.getElementById('editUserLocationId').value) : null
    };
    
    // Add password if provided
    const password = document.getElementById('editUserPassword')?.value;
    if (password) {
        updatedUser.password = password;
    }
    
    try {
        await API.updateUser(id, updatedUser);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        await loadUsers();
        showNotification('User updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Error updating user: ' + error.message, 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        await API.deleteUser(id);
        await loadUsers();
        showNotification('User deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user: ' + error.message, 'error');
    }
}

