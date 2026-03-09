import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
console.log('MONGODB_URI loaded:', mongoUri ? 'Yes' : 'No');

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('Testing connection to MongoDB...');

try {
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connection successful!');
  console.log('Database:', mongoose.connection.db.databaseName);
  
  // Test collection
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.length, 'found');
  
  await mongoose.disconnect();
  console.log('✅ Disconnected successfully');
} catch (err) {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
}
