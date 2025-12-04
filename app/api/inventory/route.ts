import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location_id');

    let sql = `
      SELECT 
        i.*,
        p.name as product_name,
        p.category,
        p.sku,
        l.name as location_name
      FROM inventory i
      INNER JOIN products p ON i.product_id = p.id
      INNER JOIN locations l ON i.location_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by location if user has a location (non-admin)
    if (decoded.role !== 'super_admin' && decoded.location_id) {
      sql += ' AND i.location_id = ?';
      params.push(decoded.location_id);
    } else if (locationId) {
      sql += ' AND i.location_id = ?';
      params.push(locationId);
    }

    sql += ' ORDER BY i.updated_at DESC';

    const inventory: any = await query(sql, params);

    return NextResponse.json({ inventory });
  } catch (error: any) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { location_id, product_id, quantity, unit_price } = await request.json();

    if (!location_id || !product_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Location ID, product ID, and quantity are required' },
        { status: 400 }
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
        [quantity, unit_price || existing[0].unit_price, location_id, product_id]
      );
    } else {
      // Create new
      await query(
        'INSERT INTO inventory (location_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [location_id, product_id, quantity, unit_price || 0]
      );
    }

    const updated: any = await query(
      'SELECT * FROM inventory WHERE location_id = ? AND product_id = ?',
      [location_id, product_id]
    );

    return NextResponse.json({ inventory: updated[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

