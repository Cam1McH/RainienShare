import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authorized to access admin data
    const user = await getServerUser();
    if (!user || !['admin', 'founder'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }
    
    // Get users count
    const [usersResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult[0].count;
    
    // Get active subscriptions count
    const [subscriptionsResult] = await db.query(
      'SELECT COUNT(*) as count FROM subscriptions WHERE status = "active"'
    );
    const activeSubscriptions = subscriptionsResult[0].count;
    
    // Get AI models count
    const [modelsResult] = await db.query('SELECT COUNT(*) as count FROM ai_models');
    const totalModels = modelsResult[0].count;
    
    // Get total revenue (example query - adjust to your schema)
    const [revenueResult] = await db.query(
      'SELECT SUM(amount) as total FROM payments WHERE status = "completed"'
    );
    const totalRevenue = revenueResult[0].total || 0;
    
    // Get pending support tickets
    const [ticketsResult] = await db.query(
      'SELECT COUNT(*) as count FROM support_tickets WHERE status = "open"'
    );
    const pendingSupport = ticketsResult[0].count;
    
    // Get security alerts
    const [alertsResult] = await db.query(
      'SELECT COUNT(*) as count FROM security_alerts WHERE status = "active"'
    );
    const securityAlerts = alertsResult[0].count;
    
    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalModels,
      totalRevenue,
      pendingSupport,
      securityAlerts
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard stats' },
      { status: 500 }
    );
  }
}