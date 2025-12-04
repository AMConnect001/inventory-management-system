import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only warehouse managers can add initial stock
    if (decoded.role !== 'super_admin' && decoded.role !== 'warehouse_manager') {
      return NextResponse.json(
        { error: 'Only warehouse managers can add initial stock' },
        { status: 403 }
      );
    }

    const { location_id, product_id, quantity, unit_price } = await request.json();

    if (!location_id || !product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Location ID, product ID, and valid quantity are required' },
        { status: 400 }
      );
    }

    // Verify location is a warehouse
    const location: any = await query('SELECT * FROM locations WHERE id = ?', [location_id]);
    if (location.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    if (location[0].type !== 'warehouse') {
      return NextResponse.json(
        { error: 'Initial stock can only be added to warehouses' },
        { status: 400 }
      );
    }

    // Check if user has permission for this location (non-admin)
    if (decoded.role !== 'super_admin' && decoded.location_id !== location_id) {
      return NextResponse.json(
        { error: 'You can only add stock to your own warehouse' },
        { status: 403 }
      );
    }

    // Verify product exists
    const product: any = await query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if inventory item exists
    const existing: any = await query(
      'SELECT * FROM inventory WHERE location_id = ? AND product_id = ?',
      [location_id, product_id]
    );

    if (existing.length > 0) {
      // Update existing
      await query(
        'UPDATE inventory SET quantity = quantity + ?, unit_price = ? WHERE location_id = ? AND product_id = ?',
        [quantity, unit_price || existing[0].unit_price || product[0].unit_price, location_id, product_id]
      );
    } else {
      // Create new
      await query(
        'INSERT INTO inventory (location_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [location_id, product_id, quantity, unit_price || product[0].unit_price || 0]
      );
    }

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [
        decoded.id,
        'Initial Stock Added',
        `Added ${quantity} units of ${product[0].name} to ${location[0].name}`,
        'inventory',
        location_id
      ]
    );

    const updated: any = await query(
      `SELECT i.*, p.name as product_name, l.name as location_name
       FROM inventory i
       INNER JOIN products p ON i.product_id = p.id
       INNER JOIN locations l ON i.location_id = l.id
       WHERE i.location_id = ? AND i.product_id = ?`,
      [location_id, product_id]
    );

    return NextResponse.json({ inventory: updated[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Add initial stock error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


