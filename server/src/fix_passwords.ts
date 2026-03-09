import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;

async function verifyAndFix() {
    const password = 'KpAms@2025';
    const newHash = await bcrypt.hash(password, 10);
    console.log(`Newly generated hash: ${newHash}`);

    const isMatch = await bcrypt.compare(password, newHash);
    console.log(`Local verification: ${isMatch}`);

    if (!isMatch) {
        console.error('CRITICAL: Local hash verification failed!');
        return;
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const result = await client.query('UPDATE profiles SET password_hash = $1', [newHash]);
        console.log(`Successfully updated ${result.rowCount} profiles.`);

        const checkRes = await client.query('SELECT email, password_hash FROM profiles WHERE email = $1', ['admin@kirtanepandit.com']);
        const dbHash = checkRes.rows[0].password_hash;
        console.log(`DB hash for admin: ${dbHash}`);

        const dbMatch = await bcrypt.compare(password, dbHash);
        console.log(`DB hash verification for admin: ${dbMatch}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

verifyAndFix();
