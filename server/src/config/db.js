import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path dotenv loading (checks server/.env and root .env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to current working directory

let isConnected = false;

// Sanitize MongoDB URI to mask user credentials in all logs
export const maskMongoUri = (uri) => {
  if (!uri) return 'NOT_CONFIGURED';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  } catch {
    return 'MASKED_URI';
  }
};

/**
 * Validates and normalizes connection string safely
 */
export const normalizeMongoUri = (rawUri) => {
  if (!rawUri) return '';
  let uri = rawUri.trim();

  // If URI has username and password, verify if password contains unencoded characters
  const match = uri.match(/^mongodb(\+srv)?:\/\/([^:]+):([^@]+)@(.+)$/);
  if (match) {
    const protocol = match[1] || '';
    const user = match[2];
    const password = match[3];
    const rest = match[4];

    // Decode if already encoded, then encode properly
    const decodedPassword = decodeURIComponent(password);
    const encodedPassword = encodeURIComponent(decodedPassword);

    uri = `mongodb${protocol}://${encodeURIComponent(decodeURIComponent(user))}:${encodedPassword}@${rest}`;
  }

  return uri;
};

export const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri || rawUri === 'your_actual_mongodb_atlas_connection_string') {
    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB_URI is not configured in server/.env');
    console.warn('   Please provide your MongoDB Atlas connection string in server/.env');
    console.warn('   Example: MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ecotrack');
    console.warn('   The server will start, but database operations will be unavailable');
    console.warn('======================================================\n');
    isConnected = false;
    return false;
  }

  const uri = normalizeMongoUri(rawUri);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
      dbName: 'ecotrack' // Explicitly set database name to avoid defaulting to "test"
    });

    isConnected = true;
    const host = conn.connection.host || 'MongoDB Atlas Host';
    const dbName = conn.connection.name || 'ecotrack';
    console.log(`✅ MongoDB Atlas connected successfully!`);
    console.log(`   Host:     ${host}`);
    console.log(`   Database: ${dbName}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB connection disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
      isConnected = true;
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error(`\n❌ Failed to connect to MongoDB Atlas:`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Target URI:    ${maskMongoUri(uri)}`);

    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('\n🔍 Diagnosis: Authentication Failed (bad auth)');
      console.error('   1. Verify in MongoDB Atlas > Security > Database Access:');
      console.error('      - The database user exists (e.g. "project")');
      console.error('      - The password matches exactly (case-sensitive)');
      console.error('      - The user has "Read and write to any database" privileges');
      console.error('   2. Verify in MongoDB Atlas > Security > Network Access:');
      console.error('      - IP 0.0.0.0/0 (or your current IP) is added to the IP Access List.\n');
    } else if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.error('\n🔍 Diagnosis: Network Whitelist Restriction');
      console.error('   Go to MongoDB Atlas > Security > Network Access and click "Add IP Address" -> "Allow Access from Anywhere" (0.0.0.0/0).\n');
    }

    return false;
  }
};

export const getDBStatus = () => {
  const stateCode = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[stateCode] || 'unknown';

  return {
    state,
    isConnected: stateCode === 1,
    host: isConnected ? mongoose.connection.host : null,
    dbName: isConnected ? mongoose.connection.name : null
  };
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed gracefully');
  }
};
