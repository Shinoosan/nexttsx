// scripts/init-db.ts
import { connectToDatabase } from '../src/lib/mongodb';

async function initializeDB() {
  try {
    const { db } = await connectToDatabase();

    // Create proxies collection if it doesn't exist
    await db.createCollection('proxies');

    // Add default proxy if none exists
    const existingProxy = await db.collection('proxies').findOne({ isActive: true });
    
    if (!existingProxy) {
      await db.collection('proxies').insertOne({
        proxy: 'resi-ww.lightningproxies.net:9999:zibtiirpasrdeyx61553-zone-resi:krqegvgwja',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDB();