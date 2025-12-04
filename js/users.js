// Users Management (Admin Only)

function loadUsers() {
    if (typeof requireAdmin === 'function' && !requireAdmin()) {
        return;
    }
    
    renderUsersTable(users);
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

function addUser() {
    const form = document.getElementById('addUserForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        role: document.getElementById('userRole').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    
    loadUsers();
    showNotification('User added successfully!', 'success');
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

function updateUser() {
    const form = document.getElementById('editUserForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = parseInt(document.getElementById('editUserId').value);
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    user.name = document.getElementById('editUserName').value.trim();
    user.email = document.getElementById('editUserEmail').value.trim();
    user.role = document.getElementById('editUserRole').value;
    user.status = document.getElementById('editUserStatus').value;
    
    saveUsers();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    modal.hide();
    
    loadUsers();
    showNotification('User updated successfully!', 'success');
}

function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    users = users.filter(u => u.id !== id);
    saveUsers();
    
    loadUsers();
    showNotification('User deleted successfully!', 'success');
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

