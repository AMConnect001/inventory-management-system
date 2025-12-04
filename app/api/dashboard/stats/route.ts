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

    // Get products count
    const productsResult: any = await query('SELECT COUNT(*) as count FROM products WHERE status = ?', ['active']);
    const totalProducts = productsResult[0]?.count || 0;

    // Get inventory stats
    let inventorySql = `
      SELECT 
        SUM(i.quantity) as total_quantity,
        SUM(i.quantity * i.unit_price) as total_value,
        COUNT(DISTINCT i.product_id) as unique_products
      FROM inventory i
      WHERE 1=1
    `;
    const inventoryParams: any[] = [];

    if (decoded.role !== 'super_admin' && decoded.location_id) {
      inventorySql += ' AND i.location_id = ?';
      inventoryParams.push(decoded.location_id);
    }

    const inventoryStats: any = await query(inventorySql, inventoryParams);
    const stats = inventoryStats[0] || {};

    // Get pending movements count
    let movementsSql = 'SELECT COUNT(*) as count FROM movements WHERE status = ?';
    const movementsParams: any[] = ['pending'];

    if (decoded.role !== 'super_admin' && decoded.location_id) {
      movementsSql += ' AND (from_location_id = ? OR to_location_id = ?)';
      movementsParams.push(decoded.location_id, decoded.location_id);
    }

    const movementsResult: any = await query(movementsSql, movementsParams);
    const pendingMovements = movementsResult[0]?.count || 0;

    // Get activity logs count
    let logsSql = 'SELECT COUNT(*) as count FROM activity_logs';
    const logsParams: any[] = [];

    if (decoded.role !== 'super_admin' && decoded.location_id) {
      // Filter by user's activities
      logsSql += ' WHERE user_id = ?';
      logsParams.push(decoded.id);
    }

    const logsResult: any = await query(logsSql, logsParams);
    const activityLogs = logsResult[0]?.count || 0;

    // Calculate average value
    const avgValue = stats.total_quantity > 0 
      ? (parseFloat(stats.total_value || 0) / parseFloat(stats.total_quantity || 1))
      : 0;

    return NextResponse.json({
      stats: {
        totalProducts,
        totalInventory: parseInt(stats.total_quantity || 0),
        pendingMovements,
        activityLogs,
        totalValue: parseFloat(stats.total_value || 0),
        avgValue,
        uniqueProducts: parseInt(stats.unique_products || 0),
      },
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


