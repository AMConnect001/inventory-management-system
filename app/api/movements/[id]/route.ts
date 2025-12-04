import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const movements: any = await query(
      `SELECT m.*, l1.name as from_location_name, l2.name as to_location_name, u.name as created_by_name
       FROM movements m
       INNER JOIN locations l1 ON m.from_location_id = l1.id
       INNER JOIN locations l2 ON m.to_location_id = l2.id
       INNER JOIN users u ON m.created_by = u.id
       WHERE m.id = ?`,
      [params.id]
    );

    if (movements.length === 0) {
      return NextResponse.json({ error: 'Movement not found' }, { status: 404 });
    }

    const movement = movements[0];

    // Get items
    const items: any = await query(
      `SELECT mi.*, p.name as product_name 
       FROM movement_items mi 
       INNER JOIN products p ON mi.product_id = p.id 
       WHERE mi.movement_id = ?`,
      [params.id]
    );
    movement.items = items;

    // Get activities
    const activities: any = await query(
      `SELECT ma.*, u.name as user_name
       FROM movement_activities ma
       LEFT JOIN users u ON ma.user_id = u.id
       WHERE ma.movement_id = ?
       ORDER BY ma.created_at DESC`,
      [params.id]
    );
    movement.activities = activities;

    return NextResponse.json({ movement });
  } catch (error: any) {
    console.error('Get movement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, action, description } = await request.json();

    // Get current movement
    const movements: any = await query('SELECT * FROM movements WHERE id = ?', [params.id]);
    if (movements.length === 0) {
      return NextResponse.json({ error: 'Movement not found' }, { status: 404 });
    }

    const movement = movements[0];

    // Update status if provided
    if (status) {
      await query('UPDATE movements SET status = ? WHERE id = ?', [status, params.id]);

      // If status is 'received', update inventory
      if (status === 'received') {
        // Get movement items
        const items: any = await query(
          'SELECT * FROM movement_items WHERE movement_id = ?',
          [params.id]
        );

        // Deduct from source location
        for (const item of items) {
          await query(
            'UPDATE inventory SET quantity = quantity - ? WHERE location_id = ? AND product_id = ?',
            [item.quantity, movement.from_location_id, item.product_id]
          );
        }

        // Add to destination location
        for (const item of items) {
          const existing: any = await query(
            'SELECT * FROM inventory WHERE location_id = ? AND product_id = ?',
            [movement.to_location_id, item.product_id]
          );

          if (existing.length > 0) {
            await query(
              'UPDATE inventory SET quantity = quantity + ?, unit_price = ? WHERE location_id = ? AND product_id = ?',
              [item.quantity, item.unit_price, movement.to_location_id, item.product_id]
            );
          } else {
            await query(
              'INSERT INTO inventory (location_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
              [movement.to_location_id, item.product_id, item.quantity, item.unit_price]
            );
          }
        }
      }
    }

    // Add activity if provided
    if (action) {
      await query(
        'INSERT INTO movement_activities (movement_id, action, description, user_id) VALUES (?, ?, ?, ?)',
        [params.id, action, description || null, decoded.id]
      );
    }

    const updated: any = await query(
      `SELECT m.*, l1.name as from_location_name, l2.name as to_location_name 
       FROM movements m
       INNER JOIN locations l1 ON m.from_location_id = l1.id
       INNER JOIN locations l2 ON m.to_location_id = l2.id
       WHERE m.id = ?`,
      [params.id]
    );

    return NextResponse.json({ movement: updated[0] });
  } catch (error: any) {
    console.error('Update movement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

