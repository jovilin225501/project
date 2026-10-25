import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB, disconnectDB } from '../config/db.js';

const createInitialAdmin = async () => {
  console.log('🛡️  EcoTrack Admin Setup Script');

  const adminName = process.env.ADMIN_NAME || 'EcoTrack Administrator';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecotrack.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  const connected = await connectDB();
  if (!connected) {
    console.error('Cannot create admin: MongoDB is not connected.');
    process.exit(1);
  }

  try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`ℹ️  Admin user already exists with email: ${adminEmail}`);
      } else {
        existing.role = 'admin';
        await existing.save();
        console.log(`✅ Promoted existing user ${adminEmail} to admin`);
      }
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+1 555-0199',
        address: 'EcoTrack Operations HQ, Civic Center',
        isActive: true
      });
      console.log(`🎉 Administrator account created successfully:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Role: admin`);
    }
  } catch (error) {
    console.error('❌ Error creating administrator:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

createInitialAdmin();
