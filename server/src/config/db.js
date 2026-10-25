import mongoose from 'mongoose';

let isConnected = false;

// Sanitize MongoDB URI to mask user credentials in logs
export const maskMongoUri = (uri) => {
  if (!uri) return 'NOT_CONFIGURED';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  } catch {
    return 'MASKED_URI';
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_actual_mongodb_atlas_connection_string') {
    console.warn('\n======================================================');
    console.warn('⚠️  MONGODB_URI is not configured in server/.env');
    console.warn('   Please provide your MongoDB Atlas connection string in server/.env');
    console.warn('   Example: MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ecotrack');
    console.warn('   The server will start, but database operations will be unavailable');
    console.warn('======================================================\n');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });

    isConnected = true;
    const host = conn.connection.host || 'MongoDB Host';
    console.log(`✅ MongoDB Atlas connected successfully to host: ${host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB connection lost');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      isConnected = true;
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    console.error(`   Target URI: ${maskMongoUri(uri)}`);
    console.error('   Please check your network access (whitelist IP 0.0.0.0/0 in Atlas) and credentials.');
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
