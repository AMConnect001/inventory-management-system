import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { canSendTo, getAllowedDestinationTypes } from '@/lib/locationHierarchy';

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
    const status = searchParams.get('status');
    const fromLocationId = searchParams.get('from_location_id');
    const toLocationId = searchParams.get('to_location_id');

    let sql = `
      SELECT 
        m.*,
        l1.name as from_location_name,
        l2.name as to_location_name,
        u.name as created_by_name
      FROM movements m
      INNER JOIN locations l1 ON m.from_location_id = l1.id
      INNER JOIN locations l2 ON m.to_location_id = l2.id
      INNER JOIN users u ON m.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by user location if not admin
    if (decoded.role !== 'super_admin' && decoded.location_id) {
      sql += ' AND (m.from_location_id = ? OR m.to_location_id = ?)';
      params.push(decoded.location_id, decoded.location_id);
    }

    if (status) {
      sql += ' AND m.status = ?';
      params.push(status);
    }

    if (fromLocationId) {
      sql += ' AND m.from_location_id = ?';
      params.push(fromLocationId);
    }

    if (toLocationId) {
      sql += ' AND m.to_location_id = ?';
      params.push(toLocationId);
    }

    sql += ' ORDER BY m.created_at DESC';

    const movements: any = await query(sql, params);

    // Get items for each movement
    for (const movement of movements) {
      const items: any = await query(
        `SELECT mi.*, p.name as product_name 
         FROM movement_items mi 
         INNER JOIN products p ON mi.product_id = p.id 
         WHERE mi.movement_id = ?`,
        [movement.id]
      );
      movement.items = items;
    }

    return NextResponse.json({ movements });
  } catch (error: any) {
    console.error('Get movements error:', error);
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

    const { from_location_id, to_location_id, items, notes } = await request.json();

    if (!from_location_id || !to_location_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'From location, to location, and items are required' },
        { status: 400 }
      );
    }

    // Validate location hierarchy
    const fromLocation: any = await query('SELECT * FROM locations WHERE id = ?', [from_location_id]);
    const toLocation: any = await query('SELECT * FROM locations WHERE id = ?', [to_location_id]);

    if (fromLocation.length === 0 || toLocation.length === 0) {
      return NextResponse.json(
        { error: 'Invalid location specified' },
        { status: 400 }
      );
    }

    if (from_location_id === to_location_id) {
      return NextResponse.json(
        { error: 'Source and destination locations must be different' },
        { status: 400 }
      );
    }

    // Check if user can send from this location (non-admin users can only send from their location)
    if (decoded.role !== 'super_admin' && decoded.location_id !== from_location_id) {
      return NextResponse.json(
        { error: 'You can only send stock from your own location' },
        { status: 403 }
      );
    }

    // Validate hierarchy
    if (!canSendTo(fromLocation[0].type, toLocation[0].type)) {
      return NextResponse.json(
        { 
          error: `${fromLocation[0].type.replace('_', ' ')} cannot send stock to ${toLocation[0].type.replace('_', ' ')}`,
          allowedTypes: getAllowedDestinationTypes(fromLocation[0].type)
        },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of items) {
      const inventory: any = await query(
        'SELECT quantity FROM inventory WHERE location_id = ? AND product_id = ?',
        [from_location_id, item.product_id]
      );

      if (inventory.length === 0 || inventory[0].quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.product_id}` },
          { status: 400 }
        );
      }
    }

    // Create movement
    const result: any = await query(
      'INSERT INTO movements (from_location_id, to_location_id, status, notes, created_by) VALUES (?, ?, ?, ?, ?)',
      [from_location_id, to_location_id, 'pending', notes || null, decoded.id]
    );

    const movementId = result.insertId;

    // Add movement items
    for (const item of items) {
      await query(
        'INSERT INTO movement_items (movement_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [movementId, item.product_id, item.quantity, item.unit_price || 0]
      );
    }

    // Add activity log
    await query(
      'INSERT INTO movement_activities (movement_id, action, description, user_id) VALUES (?, ?, ?, ?)',
      [movementId, 'Created', 'Movement created', decoded.id]
    );

    const movements: any = await query(
      `SELECT m.*, l1.name as from_location_name, l2.name as to_location_name 
       FROM movements m
       INNER JOIN locations l1 ON m.from_location_id = l1.id
       INNER JOIN locations l2 ON m.to_location_id = l2.id
       WHERE m.id = ?`,
      [movementId]
    );

    const movement = movements[0];
    const movementItems: any = await query(
      `SELECT mi.*, p.name as product_name 
       FROM movement_items mi 
       INNER JOIN products p ON mi.product_id = p.id 
       WHERE mi.movement_id = ?`,
      [movementId]
    );
    movement.items = movementItems;

    return NextResponse.json({ movement }, { status: 201 });
  } catch (error: any) {
    console.error('Create movement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

