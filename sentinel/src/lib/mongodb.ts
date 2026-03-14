import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

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
    _promise = getClientPromise();
  }
  return _promise;
}

export default ensureClient;

/**
 * Get the sentinel database instance.
 */
export async function getDb(): Promise<Db> {
  const client = await ensureClient();
  return client.db('sentinel');
}
