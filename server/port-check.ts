import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connString = process.env.DATABASE_URL || '';

async function testConnection(port: number) {
    const testString = connString.replace(':5432/', `:${port}/`);
    console.log(`\n📡 Testing connection on port ${port}...`);

    const client = new Client({
        connectionString: testString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS: Connected to port ${port}`);
        const res = await client.query('SELECT NOW()');
        console.log(`⏰ DB Time: ${res.rows[0].now}`);
        await client.end();
        return true;
    } catch (err: any) {
        console.error(`❌ FAILED: Port ${port}`);
        console.error(`   Error: ${err.message}`);
        return false;
    }
}

async function run() {
    console.log('🧪 Starting Database Port Diagnostics');
    const success5432 = await testConnection(5432);
    const success6543 = await testConnection(6543);

    if (!success5432 && !success6543) {
        console.log('\n🚨 BOTH PORTS FAILED.');
        console.log('Possible causes:');
        console.log('1. Your Supabase project might be "Paused". Check your Supabase dashboard.');
        console.log('2. Your internet connection/firewall is blocking outbound Postgres traffic.');
        console.log('3. The password in DATABASE_URL might be incorrect.');
    } else if (success6543 && !success5432) {
        console.log('\n💡 TIP: Use port 6543 instead of 5432 in your .env file.');
    }
}

run();
