'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  location_id?: number;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('inventory_auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('inventory_auth_token');
        localStorage.removeItem('inventory_refresh_token');
        localStorage.removeItem('inventory_user');
        router.push('/login');
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('inventory_auth_token');
    localStorage.removeItem('inventory_refresh_token');
    localStorage.removeItem('inventory_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleDisplayName = (role: string) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const navItems = [
    { href: '/dashboard', icon: 'bi-grid', label: 'Dashboard', section: 'dashboard' },
    { href: '/products', icon: 'bi-box-seam', label: 'Products', section: 'products' },
    { href: '/inventory', icon: 'bi-file-text', label: 'Inventory', section: 'inventory' },
    { href: '/movements', icon: 'bi-arrow-left-right', label: 'Stock Movements', section: 'movements' },
    { href: '/activity-log', icon: 'bi-clock-history', label: 'Activity Log', section: 'activity-log' },
  ];

  // Filter nav items based on role
  const filteredNavItems = navItems.filter((item) => {
    if (user.role === 'super_admin') return true;
    if (user.role === 'store_manager') {
      return ['dashboard', 'products', 'inventory', 'activity-log'].includes(item.section);
    }
    return true;
  });

  return (
    <div className="wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="logo-text">
            <h4 className="mb-0">Inventory</h4>
            <small className="text-muted">{getRoleDisplayName(user.role)}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h6 className="nav-section-title">Main Menu</h6>
            <ul className="nav-menu">
              {filteredNavItems.map((item) => (
                <li key={item.href} className="nav-item">
                  <Link
                    href={item.href}
                    className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                  >
                    <i className={`bi ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="sign-out-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Sign Out</span>
          </a>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-header">
          <div className="header-content">
            <i className="bi bi-file-text me-2"></i>
            <span>Inventory Management System - {getRoleDisplayName(user.role)}</span>
          </div>
        </div>

        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}

