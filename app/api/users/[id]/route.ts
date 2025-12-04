import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

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
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only super admin can view any user, others can only view themselves
    if (decoded.role !== 'super_admin' && decoded.id !== parseInt(params.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users: any = await query(
      'SELECT id, email, name, role, location_id, created_at FROM users WHERE id = ?',
      [params.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    if (user.location_id) {
      const locations: any = await query('SELECT name FROM locations WHERE id = ?', [user.location_id]);
      user.location_name = locations[0]?.name || null;
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
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

    // Only super admin can update any user, others can only update themselves
    if (decoded.role !== 'super_admin' && decoded.id !== parseInt(params.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, password, name, role, location_id } = await request.json();

    // Check if user exists
    const existing: any = await query('SELECT * FROM users WHERE id = ?', [params.id]);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (email && email !== existing[0].email) {
      // Check if new email already exists
      const emailCheck: any = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, params.id]);
      if (emailCheck.length > 0) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      updates.push('email = ?');
      values.push(email);
    }

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (role && decoded.role === 'super_admin') {
      updates.push('role = ?');
      values.push(role);
    }

    if (location_id !== undefined) {
      if (location_id) {
        const locations: any = await query('SELECT id FROM locations WHERE id = ?', [location_id]);
        if (locations.length === 0) {
          return NextResponse.json(
            { error: 'Invalid location ID' },
            { status: 400 }
          );
        }
      }
      updates.push('location_id = ?');
      values.push(location_id || null);
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(params.id);
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updated: any = await query(
      'SELECT id, email, name, role, location_id, created_at FROM users WHERE id = ?',
      [params.id]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [decoded.id, 'User Updated', `Updated user: ${updated[0].email}`, 'user', params.id]
    );

    return NextResponse.json({ user: updated[0] });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Only super admin can delete users
    if (decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot delete yourself
    if (decoded.id === parseInt(params.id)) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const users: any = await query('SELECT email FROM users WHERE id = ?', [params.id]);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await query('DELETE FROM users WHERE id = ?', [params.id]);

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [decoded.id, 'User Deleted', `Deleted user: ${users[0].email}`, 'user', params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


