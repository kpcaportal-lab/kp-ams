import pool from './src/db/pool';

async function check() {
    console.log('🔍 Checking database connection...');
    try {
        const timeRes = await pool.query('SELECT NOW()');
        console.log('✅ Connection successful. Server time:', timeRes.rows[0].now);

        const tableRes = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'profiles'
            );
        `);
        const exists = tableRes.rows[0].exists;
        console.log('📊 Profiles table exists:', exists);

        if (exists) {
            const countRes = await pool.query('SELECT COUNT(*) FROM profiles');
            console.log('👥 User count in profiles:', countRes.rows[0].count);
        } else {
            console.log('❌ Profiles table NOT found. Please run: npm run migrate');
        }

    } catch (err: any) {
        console.error('❌ Database check failed:');
        console.error(err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await pool.end();
    }
}

check();
