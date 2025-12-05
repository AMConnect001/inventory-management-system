// Products Management

async function loadProducts() {
    try {
        const data = await API.getProducts();
        products = data.products || [];
        renderProductsTable(products);
        updateProductsStats();
        updateProductCategoryFilter();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products: ' + error.message, 'error');
        renderProductsTable([]);
    }
}

function renderProductsTable(productsList) {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    if (productsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No products found. Add your first product!</td></tr>';
        return;
    }
    
    tbody.innerHTML = productsList.map(product => {
        return `
            <tr>
                <td>#${product.id}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.sku || 'N/A'}</td>
                <td>${product.category || '-'}</td>
                <td>$${(product.unit_price || product.unitPrice || 0).toFixed(2)}</td>
                <td>
                    <span class="badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${product.status || 'active'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-edit action-btn" onclick="editProduct(${product.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-delete action-btn" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateProductsStats() {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    
    // Update dashboard stats if elements exist
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
}

async function addProduct() {
    const form = document.getElementById('addProductForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newProduct = {
        name: document.getElementById('productName').value.trim(),
        sku: document.getElementById('productSku').value.trim() || null,
        category: document.getElementById('productCategory').value.trim(),
        unit_price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value.trim(),
        status: 'active'
    };
    
    try {
        await API.createProduct(newProduct);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        await loadProducts(); // Reload from API
        showNotification('Product added successfully!', 'success');
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Error adding product: ' + error.message, 'error');
    }
}

async function editProduct(id) {
    try {
        // Try to get from local array first, if not found, fetch from API
        let product = products.find(p => p.id === id);
        if (!product) {
            const data = await API.getProduct(id);
            product = data.product;
        }
        
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }
        
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductSku').value = product.sku || '';
        document.getElementById('editProductCategory').value = product.category || '';
        document.getElementById('editProductPrice').value = product.unit_price || product.unitPrice || 0;
        document.getElementById('editProductDescription').value = product.description || '';
        document.getElementById('editProductStatus').value = product.status || 'active';
        
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Error loading product: ' + error.message, 'error');
    }
}

async function updateProduct() {
    const form = document.getElementById('editProductForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = parseInt(document.getElementById('editProductId').value);
    
    const updatedProduct = {
        name: document.getElementById('editProductName').value.trim(),
        sku: document.getElementById('editProductSku').value.trim() || null,
        category: document.getElementById('editProductCategory').value.trim(),
        unit_price: parseFloat(document.getElementById('editProductPrice').value),
        description: document.getElementById('editProductDescription').value.trim(),
        status: document.getElementById('editProductStatus').value
    };
    
    try {
        await API.updateProduct(id, updatedProduct);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        await loadProducts(); // Reload from API
        showNotification('Product updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Error updating product: ' + error.message, 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await API.deleteProduct(id);
        await loadProducts(); // Reload from API
        showNotification('Product deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product: ' + error.message, 'error');
    }
}

function updateProductCategoryFilter() {
    const categoryFilter = document.getElementById('productCategoryFilter');
    if (!categoryFilter) return;
    
    const categories = [...new Set(products.map(p => p.category).filter(c => c))].sort();
    const currentValue = categoryFilter.value;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    categoryFilter.value = currentValue;
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('productSearchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('productCategoryFilter')?.value || '';
    const statusFilter = document.getElementById('productStatusFilter')?.value || '';
    
    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
                            (product.category && product.category.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || product.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderProductsTable(filtered);
}

