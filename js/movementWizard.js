// Movement Wizard Component

let movementWizard = {
    currentStep: 1,
    totalSteps: 3,
    data: {
        fromLocationId: null,
        toLocationId: null,
        items: []
    },
    
    init() {
        this.render();
        this.setupEventListeners();
    },
    
    render() {
        const modal = document.getElementById('movementWizardModal');
        if (!modal) {
            this.createModal();
        }
        this.updateStep();
    },
    
    createModal() {
        const modalHTML = `
            <div class="modal fade" id="movementWizardModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">New Stock Transfer</h5>
                            <button type="button" class="btn-close" onclick="movementWizard.close()"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Progress Steps -->
                            <div class="wizard-progress mb-4">
                                <div class="wizard-step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
                                    <div class="wizard-step-number">1</div>
                                    <div class="wizard-step-label">Select Locations</div>
                                </div>
                                <div class="wizard-step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
                                    <div class="wizard-step-number">2</div>
                                    <div class="wizard-step-label">Add Products</div>
                                </div>
                                <div class="wizard-step ${this.currentStep >= 3 ? 'active' : ''}">
                                    <div class="wizard-step-number">3</div>
                                    <div class="wizard-step-label">Review & Confirm</div>
                                </div>
                            </div>
                            
                            <!-- Step Content -->
                            <div id="wizardStepContent"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="wizardPrevBtn" onclick="movementWizard.prevStep()" style="display: none;">Previous</button>
                            <button type="button" class="btn btn-secondary" onclick="movementWizard.close()">Cancel</button>
                            <button type="button" class="btn btn-primary" id="wizardNextBtn" onclick="movementWizard.nextStep()">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    updateStep() {
        const stepContent = document.getElementById('wizardStepContent');
        if (!stepContent) return;
        
        const prevBtn = document.getElementById('wizardPrevBtn');
        const nextBtn = document.getElementById('wizardNextBtn');
        
        // Update progress indicators
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        // Show/hide previous button
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }
        
        // Update next button text
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Confirm' : 'Next';
        }
        
        // Render step content
        switch(this.currentStep) {
            case 1:
                stepContent.innerHTML = this.renderStep1();
                break;
            case 2:
                stepContent.innerHTML = this.renderStep2();
                break;
            case 3:
                stepContent.innerHTML = this.renderStep3();
                break;
        }
    },
    
    renderStep1() {
        const userLocation = getUserLocation();
        const user = Auth.getUser();
        
        // Get available locations based on user's role
        let availableFromLocations = [];
        let availableToLocations = [];
        
        if (userLocation) {
            // User can only send from their location
            availableFromLocations = [userLocation];
            
            // Get locations user can send to based on hierarchy
            const allowedTypes = LOCATION_HIERARCHY[userLocation.type] || [];
            availableToLocations = locations.filter(loc => 
                allowedTypes.includes(loc.type) && loc.id !== userLocation.id
            );
        } else {
            // Super admin can see all locations
            availableFromLocations = locations;
            availableToLocations = locations;
        }
        
        return `
            <h6 class="mb-3">Select Source and Destination Locations</h6>
            ${userLocation ? `
                <div class="alert alert-info mb-3">
                    <i class="bi bi-info-circle me-2"></i>
                    You are sending from: <strong>${userLocation.name}</strong>
                </div>
            ` : ''}
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">From Location *</label>
                    <select class="form-select" id="wizardFromLocation" required ${userLocation ? 'disabled' : ''}>
                        <option value="">Select source location...</option>
                        ${availableFromLocations.map(loc => `
                            <option value="${loc.id}" ${this.data.fromLocationId === loc.id ? 'selected' : ''}>
                                ${loc.name} (${loc.type})
                            </option>
                        `).join('')}
                    </select>
                    <small class="text-muted">${userLocation ? 'Your location' : 'Select source location'}</small>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">To Location *</label>
                    <select class="form-select" id="wizardToLocation" required>
                        <option value="">Select destination location...</option>
                        ${availableToLocations.map(loc => `
                            <option value="${loc.id}" ${this.data.toLocationId === loc.id ? 'selected' : ''}>
                                ${loc.name} (${loc.type})
                            </option>
                        `).join('')}
                    </select>
                    <small class="text-muted">Select destination (${userLocation ? LOCATION_HIERARCHY[userLocation.type]?.join(', ') || 'none' : 'any location'})</small>
                </div>
            </div>
            ${userLocation ? `
                <div class="alert alert-warning">
                    <small><i class="bi bi-exclamation-triangle me-1"></i>
                    You can only send to: ${LOCATION_HIERARCHY[userLocation.type]?.map(t => t.replace('_', ' ')).join(', ') || 'none'}
                    </small>
                </div>
            ` : ''}
            <div id="wizardStep1Error" class="alert alert-danger d-none"></div>
        `;
    },
    
    renderStep2() {
        const availableProducts = products.filter(p => p.status === 'active');
        const fromLocationId = this.data.fromLocationId || (getUserLocation()?.id);
        
        return `
            <h6 class="mb-3">Add Products to Transfer</h6>
            ${fromLocationId ? `
                <div class="alert alert-info mb-3">
                    <i class="bi bi-info-circle me-2"></i>
                    Showing available stock from your location
                </div>
            ` : ''}
            <div class="mb-3">
                <label class="form-label">Select Product</label>
                <select class="form-select" id="wizardProductSelect" onchange="movementWizard.updateAvailableStock()">
                    <option value="">Choose a product...</option>
                    ${availableProducts.map(product => {
                        const availableQty = fromLocationId && typeof getInventoryQuantity === 'function' 
                            ? getInventoryQuantity(fromLocationId, product.id) 
                            : 'N/A';
                        const unitPrice = product.unit_price || product.unitPrice || 0;
                        return `
                            <option value="${product.id}" data-price="${unitPrice}">
                                ${product.name} - $${unitPrice.toFixed(2)} 
                                ${fromLocationId ? `(Available: ${availableQty})` : ''}
                            </option>
                        `;
                    }).join('')}
                </select>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Available Stock</label>
                    <input type="text" class="form-control" id="wizardAvailableStock" readonly placeholder="Select a product">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control" id="wizardProductQuantity" min="1" value="1">
                </div>
            </div>
            <div class="mb-3">
                <button class="btn btn-primary w-100" onclick="movementWizard.addProduct()">
                    <i class="bi bi-plus-circle me-2"></i>Add Product
                </button>
            </div>
            
            <div id="wizardProductsList" class="mt-4">
                ${this.renderProductsList()}
            </div>
            
            <div id="wizardStep2Error" class="alert alert-danger d-none mt-3"></div>
        `;
    },
    
    updateAvailableStock() {
        const productSelect = document.getElementById('wizardProductSelect');
        const availableStockInput = document.getElementById('wizardAvailableStock');
        const quantityInput = document.getElementById('wizardProductQuantity');
        
        if (!productSelect || !availableStockInput) return;
        
        const productId = parseInt(productSelect.value);
        const fromLocationId = this.data.fromLocationId || (getUserLocation()?.id);
        
        if (productId && fromLocationId && typeof getInventoryQuantity === 'function') {
            const available = getInventoryQuantity(fromLocationId, productId);
            availableStockInput.value = available;
            quantityInput.max = available;
            
            if (available === 0) {
                availableStockInput.classList.add('is-invalid');
                quantityInput.disabled = true;
            } else {
                availableStockInput.classList.remove('is-invalid');
                quantityInput.disabled = false;
            }
        } else {
            availableStockInput.value = '';
            quantityInput.removeAttribute('max');
            quantityInput.disabled = false;
        }
    },
    
    renderStep3() {
        const fromLocation = locations.find(l => l.id === this.data.fromLocationId);
        const toLocation = locations.find(l => l.id === this.data.toLocationId);
        
        let totalValue = 0;
        this.data.items.forEach(item => {
            totalValue += (item.quantity || 0) * (item.unitPrice || 0);
        });
        
        return `
            <h6 class="mb-3">Review Transfer Details</h6>
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>From:</strong> ${fromLocation ? fromLocation.name : 'Not selected'}<br>
                            <strong>To:</strong> ${toLocation ? toLocation.name : 'Not selected'}
                        </div>
                        <div class="col-md-6">
                            <strong>Total Items:</strong> ${this.data.items.length}<br>
                            <strong>Total Value:</strong> $${totalValue.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.items.map((item, index) => {
                            const product = products.find(p => p.id === item.productId);
                            const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                            return `
                                <tr>
                                    <td>${product ? product.name : 'Unknown'}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.unitPrice?.toFixed(2) || '0.00'}</td>
                                    <td>$${itemTotal.toFixed(2)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="movementWizard.removeProduct(${index})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Notes (Optional)</label>
                <textarea class="form-control" id="wizardNotes" rows="3" placeholder="Add any notes about this transfer..."></textarea>
            </div>
        `;
    },
    
    renderProductsList() {
        if (this.data.items.length === 0) {
            return '<p class="text-muted">No products added yet. Add products above.</p>';
        }
        
        return `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.items.map((item, index) => {
                            const product = products.find(p => p.id === item.productId);
                            const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                            return `
                                <tr>
                                    <td>${product ? product.name : 'Unknown'}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.unitPrice?.toFixed(2) || '0.00'}</td>
                                    <td>$${itemTotal.toFixed(2)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger" onclick="movementWizard.removeProduct(${index})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    setupEventListeners() {
        // Will be called after modal is shown
    },
    
    validateStep1() {
        const fromLocationId = parseInt(document.getElementById('wizardFromLocation')?.value);
        const toLocationId = parseInt(document.getElementById('wizardToLocation')?.value);
        const errorDiv = document.getElementById('wizardStep1Error');
        
        if (!fromLocationId || !toLocationId) {
            if (errorDiv) {
                errorDiv.classList.remove('d-none');
                errorDiv.textContent = 'Please select both source and destination locations.';
            }
            return false;
        }
        
        if (fromLocationId === toLocationId) {
            if (errorDiv) {
                errorDiv.classList.remove('d-none');
                errorDiv.textContent = 'Source and destination locations must be different.';
            }
            return false;
        }
        
        // Validate hierarchy using LOCATION_HIERARCHY
        const fromLocation = locations.find(l => l.id === fromLocationId);
        const toLocation = locations.find(l => l.id === toLocationId);
        
        if (fromLocation && toLocation) {
            const allowedTypes = LOCATION_HIERARCHY[fromLocation.type] || [];
            
            if (!allowedTypes.includes(toLocation.type)) {
                if (errorDiv) {
                    errorDiv.classList.remove('d-none');
                    const allowedTypesText = allowedTypes.map(t => t.replace('_', ' ')).join(', ') || 'none';
                    errorDiv.textContent = `${fromLocation.type.replace('_', ' ').toUpperCase()} can only send to: ${allowedTypesText}`;
                }
                return false;
            }
        }
        
        // Check if user has permission (user can only send from their location)
        const userLocation = getUserLocation();
        if (userLocation && fromLocationId !== userLocation.id) {
            if (errorDiv) {
                errorDiv.classList.remove('d-none');
                errorDiv.textContent = 'You can only send stock from your own location.';
            }
            return false;
        }
        
        if (errorDiv) {
            errorDiv.classList.add('d-none');
        }
        
        this.data.fromLocationId = fromLocationId;
        this.data.toLocationId = toLocationId;
        return true;
    },
    
    validateStep2() {
        if (this.data.items.length === 0) {
            const errorDiv = document.getElementById('wizardStep2Error');
            if (errorDiv) {
                errorDiv.classList.remove('d-none');
                errorDiv.textContent = 'Please add at least one product to transfer.';
            }
            return false;
        }
        
        // Validate availability using inventoryManager functions
        if (typeof validateMovementStock === 'function') {
            const validation = validateMovementStock(this.data.fromLocationId, this.data.items);
            
            if (!validation.valid) {
                const errorDiv = document.getElementById('wizardStep2Error');
                if (errorDiv) {
                    errorDiv.classList.remove('d-none');
                    const errorMessages = validation.errors.map(e => 
                        `${e.product}: Required ${e.required}, Available ${e.available}`
                    ).join('<br>');
                    errorDiv.innerHTML = `Insufficient stock:<br>${errorMessages}`;
                }
                return false;
            }
        } else {
            // Fallback validation
            for (const item of this.data.items) {
                const availableQty = typeof getInventoryQuantity === 'function'
                    ? getInventoryQuantity(this.data.fromLocationId, item.productId)
                    : 0;
                
                if (availableQty < item.quantity) {
                    const errorDiv = document.getElementById('wizardStep2Error');
                    if (errorDiv) {
                        errorDiv.classList.remove('d-none');
                        const product = products.find(p => p.id === item.productId);
                        errorDiv.textContent = `Insufficient stock for ${product?.name || 'selected product'}. Available: ${availableQty}, Required: ${item.quantity}`;
                    }
                    return false;
                }
            }
        }
        
        const errorDiv = document.getElementById('wizardStep2Error');
        if (errorDiv) {
            errorDiv.classList.add('d-none');
        }
        
        return true;
    },
    
    addProduct() {
        const productSelect = document.getElementById('wizardProductSelect');
        const quantityInput = document.getElementById('wizardProductQuantity');
        const fromLocationId = this.data.fromLocationId || (typeof getUserLocation === 'function' ? getUserLocation()?.id : null);
        
        if (!productSelect || !quantityInput) {
            alert('Form elements not found. Please refresh the page.');
            return;
        }
        
        const productId = parseInt(productSelect.value);
        const quantity = parseInt(quantityInput.value);
        
        if (!productId || isNaN(productId)) {
            alert('Please select a product.');
            return;
        }
        
        if (!quantity || isNaN(quantity) || quantity < 1) {
            alert('Please enter a valid quantity (must be at least 1).');
            return;
        }
        
        if (!fromLocationId) {
            alert('Source location not set. Please go back to step 1.');
            return;
        }
        
        // Check available stock
        if (fromLocationId && typeof getInventoryQuantity === 'function') {
            const available = getInventoryQuantity(fromLocationId, productId);
            if (available < quantity) {
                const product = products.find(p => p.id === productId);
                alert(`Insufficient stock! Available: ${available}, Required: ${quantity}`);
                return;
            }
        }
        
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Check if product already added
        const existingIndex = this.data.items.findIndex(item => item.productId === productId);
        if (existingIndex >= 0) {
            const newTotal = this.data.items[existingIndex].quantity + quantity;
            
            // Check total quantity doesn't exceed available
            if (fromLocationId && typeof getInventoryQuantity === 'function') {
                const available = getInventoryQuantity(fromLocationId, productId);
                if (available < newTotal) {
                    alert(`Insufficient stock! Available: ${available}, Total required: ${newTotal}`);
                    return;
                }
            }
            
            this.data.items[existingIndex].quantity = newTotal;
        } else {
            this.data.items.push({
                productId: productId,
                quantity: quantity,
                unitPrice: product.unit_price || product.unitPrice || 0
            });
        }
        
        // Reset inputs
        productSelect.value = '';
        quantityInput.value = 1;
        const availableStockInput = document.getElementById('wizardAvailableStock');
        if (availableStockInput) {
            availableStockInput.value = '';
        }
        
        // Re-render products list
        const productsListDiv = document.getElementById('wizardProductsList');
        if (productsListDiv) {
            productsListDiv.innerHTML = this.renderProductsList();
        }
    },
    
    removeProduct(index) {
        this.data.items.splice(index, 1);
        
        // Re-render products list
        const productsListDiv = document.getElementById('wizardProductsList');
        if (productsListDiv) {
            productsListDiv.innerHTML = this.renderProductsList();
        }
        
        // If step 3, re-render entire step
        if (this.currentStep === 3) {
            this.updateStep();
        }
    },
    
    nextStep() {
        if (this.currentStep === 1) {
            if (!this.validateStep1()) return;
        } else if (this.currentStep === 2) {
            if (!this.validateStep2()) return;
        } else if (this.currentStep === 3) {
            this.confirmMovement();
            return;
        }
        
        this.currentStep++;
        this.updateStep();
    },
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
        }
    },
    
    async confirmMovement() {
        if (!this.validateStep2()) return;
        
        const notes = document.getElementById('wizardNotes')?.value || '';
        
        try {
            // Create movement via API
            const movementData = {
                from_location_id: this.data.fromLocationId,
                to_location_id: this.data.toLocationId,
                items: this.data.items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice
                })),
                notes: notes
            };
            
            await API.createMovement(movementData);
            
            this.close();
            showNotification('Stock transfer created successfully!', 'success');
            
            // Reload movements from API
            if (typeof loadMovements === 'function') {
                await loadMovements();
            }
            
            // Update dashboard stats
            if (typeof updateDashboardStats === 'function') {
                updateDashboardStats();
            }
            if (typeof updateMovementsStats === 'function') {
                updateMovementsStats();
            }
            
            // Navigate to movements section if not already there
            const currentSection = getCurrentSection ? getCurrentSection() : '';
            if (currentSection !== 'stock-movements' && currentSection !== 'new-transfer') {
                // Optionally navigate to movements section
                if (typeof showSection === 'function') {
                    showSection('stock-movements');
                }
            }
        } catch (error) {
            console.error('Error creating movement:', error);
            alert('Error creating movement: ' + error.message);
        }
    },
    
    open() {
        // Reset wizard
        this.currentStep = 1;
        const userLocation = typeof getUserLocation === 'function' ? getUserLocation() : null;
        
        this.data = {
            fromLocationId: userLocation ? userLocation.id : null,
            toLocationId: null,
            items: []
        };
        
        // Ensure modal exists
        this.render();
        
        // Wait for modal to be ready
        setTimeout(() => {
            const modalElement = document.getElementById('movementWizardModal');
            if (!modalElement) {
                console.error('Movement wizard modal not found');
                return;
            }
            
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Auto-set from location if user has a location
            if (userLocation) {
                setTimeout(() => {
                    const fromSelect = document.getElementById('wizardFromLocation');
                    if (fromSelect) {
                        fromSelect.value = userLocation.id;
                    }
                }, 200);
            }
        }, 50);
    },
    
    close() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('movementWizardModal'));
        if (modal) {
            modal.hide();
        }
    }
};


