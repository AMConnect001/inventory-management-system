// Initial Stock Entry for Warehouse Managers

function openAddInitialStockModal() {
    // Populate warehouse dropdown
    const locationSelect = document.getElementById('initialStockLocation');
    if (locationSelect) {
        const warehouses = locations.filter(l => l.type === 'warehouse');
        locationSelect.innerHTML = '<option value="">Select warehouse...</option>' +
            warehouses.map(loc => 
                `<option value="${loc.id}">${loc.name}</option>`
            ).join('');
        
        // Set location to user's warehouse if applicable
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        if (userLocation && userLocation.type === 'warehouse') {
            locationSelect.value = userLocation.id;
        }
    }
    
    // Populate product dropdown
    const productSelect = document.getElementById('initialStockProduct');
    if (productSelect) {
        const availableProducts = products.filter(p => p.status === 'active' || !p.status);
        if (availableProducts.length === 0) {
            productSelect.innerHTML = '<option value="">No products available. Please create products first.</option>';
        } else {
            productSelect.innerHTML = '<option value="">Select a product...</option>' +
                availableProducts.map(p => 
                    `<option value="${p.id}" data-price="${p.unitPrice || 0}">${p.name} - $${(p.unitPrice || 0).toFixed(2)}</option>`
                ).join('');
        }
        
        // Remove existing event listeners by cloning the element
        const newProductSelect = productSelect.cloneNode(true);
        productSelect.parentNode.replaceChild(newProductSelect, productSelect);
        
        // Add event listener for auto-fill price when product is selected
        newProductSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
                const priceInput = document.getElementById('initialStockPrice');
                if (priceInput) {
                    priceInput.value = price > 0 ? price.toFixed(2) : '';
                }
            }
        });
    }
    
    // Reset form
    const form = document.getElementById('addInitialStockForm');
    if (form) {
        form.reset();
        // Re-set the location if user has one
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        if (userLocation && userLocation.type === 'warehouse' && locationSelect) {
            locationSelect.value = userLocation.id;
        }
    }
    
    const modal = new bootstrap.Modal(document.getElementById('addInitialStockModal'));
    modal.show();
}

// Store reference to inventoryManager's addInitialStock before we override it
const inventoryManagerAddInitialStock = typeof addInitialStock !== 'undefined' ? addInitialStock : null;

function addInitialStock() {
    const form = document.getElementById('addInitialStockForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }
    
    const locationId = parseInt(document.getElementById('initialStockLocation').value);
    const productId = parseInt(document.getElementById('initialStockProduct').value);
    const quantity = parseInt(document.getElementById('initialStockQuantity').value);
    const unitPrice = parseFloat(document.getElementById('initialStockPrice').value);
    
    if (!locationId || !productId || quantity <= 0 || isNaN(quantity)) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    if (isNaN(unitPrice) || unitPrice < 0) {
        alert('Please enter a valid unit price.');
        return;
    }
    
    // Check if location is warehouse
    const location = locations.find(l => l.id === locationId);
    if (!location || location.type !== 'warehouse') {
        alert('Initial stock can only be added to warehouses.');
        return;
    }
    
    // Check if product exists
    const product = products.find(p => p.id === productId);
    if (!product) {
        alert('Selected product not found.');
        return;
    }
    
    // Use updateInventory directly (simpler and more reliable)
    if (typeof updateInventory === 'function') {
        const success = updateInventory(locationId, productId, quantity, unitPrice);
        if (success) {
            // Create transaction record
            if (typeof addTransaction === 'function') {
                addTransaction('in', productId, product.name, quantity, unitPrice, 'Initial stock entry');
            }
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addInitialStockModal'));
            if (modal) modal.hide();
            form.reset();
            
            // Show success notification
            if (typeof showNotification === 'function') {
                showNotification('Initial stock added successfully!', 'success');
            } else {
                alert('Initial stock added successfully!');
            }
            
            // Reload inventory and dashboard
            setTimeout(() => {
                if (typeof loadInventory === 'function') {
                    loadInventory();
                }
                if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
                if (typeof updateDashboardStats === 'function') {
                    updateDashboardStats();
                }
            }, 100);
        } else {
            alert('Failed to add stock. Please try again.');
        }
    } else {
        alert('Inventory functions not available. Please refresh the page.');
    }
}

