import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30_000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI environment variable is not set'));
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  client = new MongoClient(uri, options);
  return client.connect();
}

// Lazy initialization — don't connect at import time (breaks build)
let _promise: Promise<MongoClient> | null = null;

function ensureClient(): Promise<MongoClient> {
  if (!_promise) {
    _promise = getClientPromise().catch((err) => {
      // Clear cached promise so next call retries instead of returning
      // the same rejected promise forever
      _promise = null;
      throw err;
    });
  }
  return _promise;
}

export default ensureClient;

/**
 * Get the sentinel database instance.
 */
let _db: Db | null = null;
let _indexesCreated = false;

export async function getDb(): Promise<Db> {
  if (_db) return _db;
  const client = await ensureClient();
  _db = client.db('sentinel');

  // Ensure indexes exist (once per process lifetime)
  if (!_indexesCreated) {
    _indexesCreated = true;
    _db.collection('detections').createIndex({ timestamp: -1 }).catch(() => {});
    _db.collection('events').createIndex({ timestamp: -1 }).catch(() => {});
    _db.collection('agent_decisions').createIndex({ timestamp: -1 }).catch(() => {});
    _db.collection('analysis_results').createIndex({ timestamp: -1 }).catch(() => {});
    _db.collection('missions').createIndex({ status: 1, createdAt: -1 }).catch(() => {});
    _db.collection('chat_messages').createIndex({ timestamp: -1 }).catch(() => {});
    _db.collection('known_faces').createIndex({ name: 1 }, { unique: true }).catch(() => {});
  }

  return _db;
}
