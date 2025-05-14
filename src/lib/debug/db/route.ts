// src/app/api/debug/db/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerUser } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user (only allow for authenticated users)
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check database connection
    try {
      const [result] = await db.query('SELECT NOW() as time');
      
      // Test querying the ai_models table
      const [models] = await db.query(
        'SELECT id, name, userId FROM ai_models WHERE userId = ? LIMIT 5',
        [user.id]
      );
      
      // Check tables and their structure
      const [tables] = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      
      const tableNames = tables.map((t: any) => t.table_name);
      
      // Get structure of ai_models table
      const [aiModelsColumns] = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'ai_models'
      `);
      
      return NextResponse.json({
        success: true,
        dbConnection: 'Connected',
        time: result[0].time,
        user: {
          id: user.id,
          email: user.email
        },
        models: models,
        tables: tableNames,
        aiModelsColumns: aiModelsColumns
      });
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({
        success: false,
        dbConnection: 'Failed',
        error: dbError.message,
        errorCode: dbError.code,
        errorNumber: dbError.errno,
        sql: dbError.sql
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}