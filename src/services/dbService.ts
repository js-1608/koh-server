import mongoose from 'mongoose';
import { memoryStore, IMemoryStore, registerDbSyncHandler, ALL_SYSTEM_MODULES } from './storeService';

// Supported application collections mapping directly to MongoDB collections
export const DB_COLLECTIONS: (keyof IMemoryStore)[] = [
  'farmers',
  'cropMasters',
  'cropCycles',
  'receipts',
  'farmPartners',
  'farmerPlots',
  'soilWaterTests',
  'farmActivities',
  'cropDiagnoses',
  'batches',
  'skus',
  'complianceTests',
  'contentItems',
  'shootClips',
  'shoots',
  'calendarPosts',
  'organicPosts',
  'influencers',
  'collabs',
  'npdProducts',
  'pnlEntries',
  'users',
  'activityLogs',
  'workers',
  'attendanceLogs',
  'utilityStock',
  'vendors',
  'purchaseOrders',
  'equipment',
  'cropProcessing',
  'shiftSchedules',
  'shiftSetups',
  'payments',
  'expenses',
  'packaging',
  'b2bLeads',
  'b2bOrders',
  'statics',
  'adCreatives',
  'paidAds',
  'packages',
  'planningScenarios',
  'demandPlans'
];

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const getDb = () => {
  if (!isDbConnected()) return null;
  return mongoose.connection.db;
};

// Persist a single document immediately to its MongoDB collection
export const saveDocToDb = async (collectionName: keyof IMemoryStore, doc: any) => {
  try {
    const db = getDb();
    if (!db || !doc) return;
    const filter: any = doc._id ? { _id: doc._id } : { id: doc.id };
    await db.collection(String(collectionName)).replaceOne(filter, doc, { upsert: true });
  } catch (err) {
    console.warn(`[MongoDB Error] Failed to save doc to ${String(collectionName)}:`, err);
  }
};

// Delete a document from its MongoDB collection
export const deleteDocFromDb = async (collectionName: keyof IMemoryStore, id: string) => {
  try {
    const db = getDb();
    if (!db || !id) return;
    await db.collection(String(collectionName)).deleteOne({ $or: [{ _id: id as any }, { id }] });
  } catch (err) {
    console.warn(`[MongoDB Error] Failed to delete doc from ${String(collectionName)}:`, err);
  }
};

// Persist an entire collection to MongoDB (handles upserts and deletions)
export const persistCollectionToDb = async (collectionName: keyof IMemoryStore) => {
  try {
    const db = getDb();
    if (!db) return;
    const items = memoryStore[collectionName];
    const col = db.collection(String(collectionName));

    if (!Array.isArray(items) || items.length === 0) {
      // If collection in memory is empty, ensure MongoDB collection is also empty
      await col.deleteMany({});
      return;
    }

    // 1. Delete any documents from MongoDB that have been removed from the application
    const currentIds = items.map((item: any) => item._id || item.id).filter(Boolean);
    if (currentIds.length > 0) {
      await col.deleteMany({ _id: { $nin: currentIds as any[] } });
    }

    // 2. Upsert all current documents
    const operations: any[] = items.map((item: any) => ({
      replaceOne: {
        filter: { _id: (item._id || item.id || `doc_${Date.now()}`) as any },
        replacement: item,
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await col.bulkWrite(operations, { ordered: false });
    }
  } catch (err) {
    console.warn(`[MongoDB Error] Failed to persist collection ${String(collectionName)}:`, err);
  }
};

// Persist all 43 collections to MongoDB
export const persistAllToDb = async () => {
  const db = getDb();
  if (!db) return;
  for (const colName of DB_COLLECTIONS) {
    await persistCollectionToDb(colName);
  }
};

// Connect automatic sync whenever saveStore is triggered
registerDbSyncHandler(async (collectionName?: keyof IMemoryStore) => {
  if (collectionName) {
    await persistCollectionToDb(collectionName);
  } else {
    await persistAllToDb();
  }
});

// Initialize database synchronization on startup
export const initDatabaseSync = async () => {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`====================================================`);
  console.log(`📦 Initializing Database Sync (Mode: ${mode.toUpperCase()})`);
  console.log(`====================================================`);

  const db = getDb();
  if (!db) {
    console.warn('[MongoDB Notice] MongoDB not connected; running in resilient memory mode.');
    return;
  }

  try {
    const existingCollections = await db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map(c => c.name));

    let migratedCollectionsCount = 0;
    let totalLoadedDocs = 0;

    for (const colName of DB_COLLECTIONS) {
      const col = db.collection(String(colName));
      const count = existingNames.has(String(colName)) ? await col.countDocuments() : 0;

      if (count > 0) {
        // Source of Truth: Load live documents from MongoDB
        const docs = await col.find({}).toArray();
        (memoryStore as any)[colName] = docs;
        totalLoadedDocs += docs.length;
      } else {
        // If collection is empty in MongoDB:
        if (mode === 'development') {
          // In development mode: migrate initial data into MongoDB so database is populated
          const initialItems = memoryStore[colName];
          if (Array.isArray(initialItems) && initialItems.length > 0) {
            await col.insertMany(initialItems as any[]);
            migratedCollectionsCount++;
            totalLoadedDocs += initialItems.length;
            console.log(`[MongoDB Initial Seed] Migrated ${initialItems.length} records into '${String(colName)}'`);
          }
        } else {
          // In production mode: strictly initialize empty array, do NOT seed dummy/mock data
          (memoryStore as any)[colName] = [];
        }
      }
    }

    // Ensure essential system admin & batch staff accounts always exist
    const userCol = db.collection('users');
    const existingAdmin = memoryStore.users.find((u: any) => u.email?.toLowerCase() === 'admin@koh.in');
    if (!existingAdmin) {
      const defaultAdmin = {
        _id: 'usr_admin',
        name: 'Admin',
        email: 'admin@koh.in',
        password: 'admin@123',
        role: 'Admin',
        modules: ALL_SYSTEM_MODULES,
        avatar: '👑',
        isActive: true,
        lastLogin: new Date()
      };
      memoryStore.users.unshift(defaultAdmin);
      await userCol.replaceOne({ email: defaultAdmin.email }, defaultAdmin, { upsert: true });
    }

    const existingShivam = memoryStore.users.find((u: any) => u.email?.toLowerCase() === 'shivam953647@gmail.com');
    if (!existingShivam) {
      const defaultShivam = {
        _id: 'usr_shivam',
        name: 'Shivam Singh',
        email: 'shivam953647@gmail.com',
        password: 'password123456',
        role: 'Batch Staff',
        modules: ['production', 'factory', 'batches', 'receiving', 'sorting', 'dehydration', 'powdering', 'packing', 'dispatch', 'farmers', 'procurement', 'inventory', 'dashboard', 'skus'],
        avatar: '👨‍🏭',
        isActive: true,
        lastLogin: new Date()
      };
      memoryStore.users.push(defaultShivam);
      await userCol.replaceOne({ email: defaultShivam.email }, defaultShivam, { upsert: true });
    }

    console.log(`[MongoDB Sync Complete] Connected to database: '${db.databaseName}'`);
    console.log(`[MongoDB Sync Complete] Total loaded documents: ${totalLoadedDocs} across ${DB_COLLECTIONS.length} collections`);
    if (migratedCollectionsCount > 0) {
      console.log(`[MongoDB Sync Complete] Successfully seeded ${migratedCollectionsCount} collections for initial development.`);
    }
  } catch (err) {
    console.error('[MongoDB Sync Error]:', err);
  }
};

// Get stats for all collections in the database
export const getDatabaseStats = async () => {
  const db = getDb();
  const connected = isDbConnected();
  const mode = process.env.NODE_ENV || 'development';

  if (!connected || !db) {
    return {
      connected: false,
      mode,
      database: null,
      collections: {},
      totalDocuments: 0,
      timestamp: new Date().toISOString()
    };
  }

  const stats: Record<string, number> = {};
  let totalDocuments = 0;

  for (const colName of DB_COLLECTIONS) {
    try {
      const count = await db.collection(String(colName)).countDocuments();
      stats[String(colName)] = count;
      totalDocuments += count;
    } catch {
      stats[String(colName)] = 0;
    }
  }

  return {
    connected: true,
    mode,
    database: db.databaseName,
    collections: stats,
    totalDocuments,
    timestamp: new Date().toISOString()
  };
};
