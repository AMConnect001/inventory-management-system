'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { API } from '@/lib/api';

interface InventoryItem {
  id: number;
  location_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name: string;
  category: string;
  location_name: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const token = localStorage.getItem('inventory_auth_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const data = await API.getInventory();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    return item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <Layout>
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row mb-4">
        <div className="col-md-6">
          <h2>
            <i className="bi bi-boxes me-2"></i>My Inventory
          </h2>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>{item.product_name}</strong>
                      </td>
                      <td>{item.category || '-'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price?.toFixed(2) || '0.00'}</td>
                      <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                      <td>{item.location_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

