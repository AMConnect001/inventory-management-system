// Login Page Logic

document.addEventListener('DOMContentLoaded', function() {
    // If already logged in, redirect to role-specific dashboard
    if (Auth.isAuthenticated()) {
        const user = Auth.getUser();
        const rolePageMap = {
            'super_admin': 'admin.html',
            'warehouse_manager': 'warehouse.html',
            'distributor': 'distributor.html',
            'sales_agent': 'sales-agent.html',
            'store_manager': 'store.html'
        };
        const redirectPage = rolePageMap[user?.role] || 'admin.html';
        window.location.href = redirectPage;
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Show loading state
        loginBtn.disabled = true;
        loginSpinner.classList.remove('d-none');
        loginError.classList.add('d-none');
        
        try {
            const result = await Auth.login(email, password);
            
            if (result.success) {
                // Show success message
                loginError.classList.remove('d-none', 'alert-danger');
                loginError.classList.add('alert-success');
                loginError.textContent = 'Login successful! Redirecting...';
                
                // Redirect to role-specific dashboard after short delay
                setTimeout(() => {
                    const rolePageMap = {
                        'super_admin': 'admin.html',
                        'warehouse_manager': 'warehouse.html',
                        'distributor': 'distributor.html',
                        'sales_agent': 'sales-agent.html',
                        'store_manager': 'store.html'
                    };
                    const redirectPage = rolePageMap[result.user?.role] || 'admin.html';
                    window.location.href = redirectPage;
                }, 500);
            } else {
                // Show error message
                loginError.classList.remove('d-none');
                loginError.classList.remove('alert-success');
                loginError.classList.add('alert-danger');
                loginError.textContent = result.error || 'Invalid email or password';
                
                loginBtn.disabled = false;
                loginSpinner.classList.add('d-none');
            }
        } catch (error) {
            loginError.classList.remove('d-none');
            loginError.classList.remove('alert-success');
            loginError.classList.add('alert-danger');
            loginError.textContent = error.message || 'An error occurred. Please try again.';
            
            loginBtn.disabled = false;
            loginSpinner.classList.add('d-none');
        }
    });
    
    // Auto-fill demo credentials (remove in production)
    document.getElementById('email').value = 'admin@inventory.com';
});

