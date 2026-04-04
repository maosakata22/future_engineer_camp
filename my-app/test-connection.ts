import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

async function testConnection() {
  console.log('Testing direct postgres connection...');
  console.log('Connection string exists:', !!connectionString);
  console.log('Connection string starts with postgresql:', connectionString.startsWith('postgresql://'));

  try {
    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    console.log('Attempting to connect...');

    const result = await sql`SELECT 1 as test`;
    console.log('Connection successful! Result:', result);

    await sql.end();
    console.log('Connection closed successfully');

  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();