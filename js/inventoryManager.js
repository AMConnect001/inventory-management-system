// Inventory Management System - Location-based Inventory

// Get inventory for a specific location and product
function getInventoryItem(locationId, productId) {
    return inventory.find(
        inv => inv.locationId === locationId && inv.productId === productId
    );
}

// Get all inventory for a specific location
function getLocationInventory(locationId) {
    return inventory.filter(inv => inv.locationId === locationId);
}

// Get inventory quantity for a location and product
function getInventoryQuantity(locationId, productId) {
    const item = getInventoryItem(locationId, productId);
    return item ? item.quantity : 0;
}

// Update inventory (add or subtract)
function updateInventory(locationId, productId, quantityChange, unitPrice = null) {
    const existingItem = getInventoryItem(locationId, productId);
    
    if (existingItem) {
        // Update existing inventory
        existingItem.quantity += quantityChange;
        
        // Update price if provided
        if (unitPrice !== null) {
            existingItem.unitPrice = unitPrice;
        }
        
        // Prevent negative inventory
        if (existingItem.quantity < 0) {
            existingItem.quantity = 0;
        }
        
        // Remove if quantity is 0
        if (existingItem.quantity === 0) {
            inventory = inventory.filter(inv => 
                !(inv.locationId === locationId && inv.productId === productId)
            );
        }
    } else if (quantityChange > 0) {
        // Create new inventory item
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error(`Product ${productId} not found`);
            return false;
        }
        
        inventory.push({
            id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
            locationId: locationId,
            productId: productId,
            productName: product.name,
            quantity: quantityChange,
            unitPrice: unitPrice || product.unitPrice || 0,
            createdAt: new Date().toISOString()
        });
    }
    
    saveInventory();
    return true;
}

// Check if location has enough stock
function hasEnoughStock(locationId, productId, requiredQuantity) {
    const currentQuantity = getInventoryQuantity(locationId, productId);
    return currentQuantity >= requiredQuantity;
}

// Validate movement items have enough stock
function validateMovementStock(fromLocationId, items) {
    const errors = [];
    
    items.forEach(item => {
        if (!hasEnoughStock(fromLocationId, item.productId, item.quantity)) {
            const product = products.find(p => p.id === item.productId);
            const available = getInventoryQuantity(fromLocationId, item.productId);
            errors.push({
                product: product ? product.name : 'Unknown',
                required: item.quantity,
                available: available
            });
        }
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Add initial stock to warehouse (for warehouse manager)
function addInitialStock(locationId, productId, quantity, unitPrice) {
    if (!locationId || !productId || quantity <= 0) {
        return { success: false, error: 'Invalid parameters' };
    }
    
    // Check if location is warehouse
    const location = locations.find(l => l.id === locationId);
    if (!location || location.type !== 'warehouse') {
        return { success: false, error: 'Initial stock can only be added to warehouses' };
    }
    
    const result = updateInventory(locationId, productId, quantity, unitPrice);
    
    if (result) {
        // Create transaction record
        const product = products.find(p => p.id === productId);
        addTransaction('in', productId, product ? product.name : 'Unknown', quantity, unitPrice, 'Initial stock entry');
        
        return { success: true };
    }
    
    return { success: false, error: 'Failed to add stock' };
}

// Get total inventory value for a location
function getLocationInventoryValue(locationId) {
    const locationInventory = getLocationInventory(locationId);
    return locationInventory.reduce((total, item) => {
        return total + (item.quantity * (item.unitPrice || 0));
    }, 0);
}

// Get inventory summary for dashboard
function getInventorySummary(locationId = null) {
    let filteredInventory = locationId 
        ? getLocationInventory(locationId)
        : inventory;
    
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;
    
    filteredInventory.forEach(item => {
        totalValue += item.quantity * (item.unitPrice || 0);
        
        if (item.quantity === 0) {
            outOfStock++;
        } else {
            // Get product's low stock threshold
            const product = products.find(p => p.id === item.productId);
            const threshold = product?.lowStockThreshold || 10;
            
            if (item.quantity <= threshold) {
                lowStock++;
            } else {
                inStock++;
            }
        }
    });
    
    return {
        totalItems: filteredInventory.length,
        inStock,
        lowStock,
        outOfStock,
        totalValue
    };
}

