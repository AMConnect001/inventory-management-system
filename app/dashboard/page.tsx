'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventory: 0,
    pendingMovements: 0,
    activityLogs: 0,
    totalValue: 0,
    avgValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('inventory_auth_token');
      if (!token) return;

      // Load products
      const productsRes = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsData = await productsRes.json();

      // Load inventory
      const inventoryRes = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const inventoryData = await inventoryRes.json();

      // Load movements
      const movementsRes = await fetch('/api/movements?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const movementsData = await movementsRes.json();

      // Load activity logs
      const logsRes = await fetch('/api/activity-logs?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const logsData = await logsRes.json();

      // Calculate stats
      const totalInventory = inventoryData.inventory.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );

      const totalValue = inventoryData.inventory.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unit_price,
        0
      );

      const avgValue =
        inventoryData.inventory.length > 0
          ? totalValue / inventoryData.inventory.length
          : 0;

      setStats({
        totalProducts: productsData.products?.length || 0,
        totalInventory,
        pendingMovements: movementsData.movements?.length || 0,
        activityLogs: logsData.logs?.length || 0,
        totalValue,
        avgValue,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="dashboard-header mb-4">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's an overview of your inventory.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-content">
                <h6 className="stat-label">Total Products</h6>
                <h2 className="stat-value">{stats.totalProducts}</h2>
                <p className="stat-description">Products in catalog</p>
              </div>
              <div className="stat-icon stat-icon-blue">
                <i className="bi bi-box-seam"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-content">
                <h6 className="stat-label">My Inventory</h6>
                <h2 className="stat-value">{stats.totalInventory}</h2>
                <p className="stat-description">Total units in stock</p>
              </div>
              <div className="stat-icon stat-icon-green">
                <i className="bi bi-graph-up"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-content">
                <h6 className="stat-label">Pending Movements</h6>
                <h2 className="stat-value">{stats.pendingMovements}</h2>
                <p className="stat-description">Awaiting action</p>
              </div>
              <div className="stat-icon stat-icon-yellow">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-content">
                <h6 className="stat-label">Activity Logs</h6>
                <h2 className="stat-value">{stats.activityLogs}</h2>
                <p className="stat-description">Your actions</p>
              </div>
              <div className="stat-icon stat-icon-green">
                <i className="bi bi-graph-up"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Inventory Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Total Inventory Value:</strong>
                <span className="fs-4 text-primary ms-2">
                  ${stats.totalValue.toFixed(2)}
                </span>
              </div>
              <div className="mb-3">
                <strong>Average Item Value:</strong>
                <span className="fs-5 text-secondary ms-2">
                  ${stats.avgValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

