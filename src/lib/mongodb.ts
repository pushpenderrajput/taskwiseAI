import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : undefined;

if (!uri) {
  throw new Error(
    'Invalid/Missing environment variable: "MONGODB_URI".\nPlease add your connection string to the .env file.\nExample: MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/your-db-name"'
  );
}

if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid scheme for "MONGODB_URI". The connection string in your .env file must start with "mongodb://" or "mongodb+srv://".');
}

const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
