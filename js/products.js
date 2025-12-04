// Products Management

function loadProducts() {
    renderProductsTable(products);
    updateProductsStats();
    updateProductCategoryFilter();
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
                <td>$${product.unitPrice?.toFixed(2) || '0.00'}</td>
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

function addProduct() {
    const form = document.getElementById('addProductForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: document.getElementById('productName').value.trim(),
        sku: document.getElementById('productSku').value.trim() || null,
        category: document.getElementById('productCategory').value.trim(),
        unitPrice: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value.trim(),
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    saveProducts();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    
    loadProducts();
    showNotification('Product added successfully!', 'success');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductSku').value = product.sku || '';
    document.getElementById('editProductCategory').value = product.category || '';
    document.getElementById('editProductPrice').value = product.unitPrice || 0;
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductStatus').value = product.status || 'active';
    
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
}

function updateProduct() {
    const form = document.getElementById('editProductForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = parseInt(document.getElementById('editProductId').value);
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    product.name = document.getElementById('editProductName').value.trim();
    product.sku = document.getElementById('editProductSku').value.trim() || null;
    product.category = document.getElementById('editProductCategory').value.trim();
    product.unitPrice = parseFloat(document.getElementById('editProductPrice').value);
    product.description = document.getElementById('editProductDescription').value.trim();
    product.status = document.getElementById('editProductStatus').value;
    
    saveProducts();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    modal.hide();
    
    loadProducts();
    showNotification('Product updated successfully!', 'success');
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    products = products.filter(p => p.id !== id);
    saveProducts();
    
    loadProducts();
    showNotification('Product deleted successfully!', 'success');
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    // Update category filter
    updateProductCategoryFilter();
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

