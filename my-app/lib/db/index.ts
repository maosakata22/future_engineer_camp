import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment');
}

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// 接続テスト関数
export async function testConnection() {
  try {
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Error details:', {
      message: (error as any)?.message,
      code: (error as any)?.code,
      cause: (error as any)?.cause,
    });
    return false;
  }
}

// 接続終了関数
export async function closeConnection() {
  await client.end();
}