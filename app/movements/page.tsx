'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface Movement {
  id: number;
  from_location_id: number;
  to_location_id: number;
  status: string;
  created_at: string;
  from_location_name: string;
  to_location_name: string;
  created_by_name: string;
  items: any[];
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadMovements();
  }, [statusFilter]);

  const loadMovements = async () => {
    try {
      const token = localStorage.getItem('inventory_auth_token');
      if (!token) return;

      const url = statusFilter
        ? `/api/movements?status=${statusFilter}`
        : '/api/movements';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMovements(data.movements || []);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    const classes: { [key: string]: string } = {
      pending: 'warning',
      approved: 'info',
      received: 'success',
      cancelled: 'danger',
    };
    return classes[status] || 'secondary';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Stock Movements</h2>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-secondary w-100"
            onClick={() => setStatusFilter('')}
          >
            <i className="bi bi-x-circle me-1"></i>Clear
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No movements found.
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id}>
                      <td>#{movement.id}</td>
                      <td>{formatDateTime(movement.created_at)}</td>
                      <td>{movement.from_location_name}</td>
                      <td>{movement.to_location_name}</td>
                      <td>{movement.items?.length || 0} items</td>
                      <td>
                        <span className={`badge bg-${getStatusClass(movement.status)}`}>
                          {movement.status}
                        </span>
                      </td>
                      <td>{movement.created_by_name || '-'}</td>
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

