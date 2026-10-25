import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import WasteReport from '../models/WasteReport.js';
import PickupRequest from '../models/PickupRequest.js';
import RewardTransaction from '../models/RewardTransaction.js';
import { connectDB, disconnectDB } from '../config/db.js';

const seedDatabase = async () => {
  console.log('🌱 Starting EcoTrack Database Seeding...');

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot seed database: MongoDB connection failed or URI is missing.');
    console.error('   Please configure MONGODB_URI in server/.env before seeding.');
    process.exit(1);
  }

  try {
    // Clear existing demonstration data
    console.log('🧹 Cleaning previous demo records...');
    await Promise.all([
      User.deleteMany({}),
      WasteReport.deleteMany({}),
      PickupRequest.deleteMany({}),
      RewardTransaction.deleteMany({})
    ]);

    // 1. Create Admin
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'EcoTrack Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@ecotrack.org',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      role: 'admin',
      phone: '+1 555-0100',
      address: 'Central Municipal Operations Center, Suite 400',
      isActive: true
    });

    // 2. Create Demonstration Residents
    const resident1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'Password123!',
      role: 'resident',
      points: 380,
      phone: '+1 555-0142',
      address: '742 Evergreen Terrace, Springfield',
      isActive: true
    });

    const resident2 = await User.create({
      name: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      password: 'Password123!',
      role: 'resident',
      points: 210,
      phone: '+1 555-0188',
      address: '104 Pinecrest Boulevard, Greenfield',
      isActive: true
    });

    const resident3 = await User.create({
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@example.com',
      password: 'Password123!',
      role: 'resident',
      points: 520,
      phone: '+1 555-0176',
      address: '22 Riverbank Lane, Oakville',
      isActive: true
    });

    console.log('👥 Created 1 administrator and 3 demonstration residents');

    // 3. Create Sample Waste Reports
    const reports = await WasteReport.insertMany([
      {
        title: 'Overflowing Plastic Bottles at Park Plaza',
        category: 'plastic',
        description: 'Large pile of single-use plastic beverage bottles and packaging near the public benches after community event.',
        location: 'Park Plaza Central Lawn, near Fountain',
        urgency: 'high',
        status: 'Completed',
        resident: resident1._id,
        assignedCollector: 'Collector Unit #4 (David Brooks)',
        pointsAwarded: true,
        pointsAmount: 30,
        statusHistory: [
          { status: 'Pending', updatedBy: resident1._id, note: 'Report submitted by resident', timestamp: new Date(Date.now() - 5 * 86400000) },
          { status: 'Approved', updatedBy: admin._id, note: 'Verified by municipal dispatch', timestamp: new Date(Date.now() - 4 * 86400000) },
          { status: 'Assigned', updatedBy: admin._id, note: 'Assigned to Collector Unit #4', timestamp: new Date(Date.now() - 3 * 86400000) },
          { status: 'In Progress', updatedBy: admin._id, note: 'Collection crew dispatched', timestamp: new Date(Date.now() - 2 * 86400000) },
          { status: 'Completed', updatedBy: admin._id, note: 'Area thoroughly cleared and plastics bagged for sorting', timestamp: new Date(Date.now() - 1 * 86400000) }
        ],
        createdAt: new Date(Date.now() - 5 * 86400000)
      },
      {
        title: 'Discarded CRT Monitor and Cables',
        category: 'electronic',
        description: 'Old computer CRT monitor, power supplies, and tangle of cables dumped on the sidewalk alleyway.',
        location: 'Alleyway behind 120 Oak Street',
        urgency: 'medium',
        status: 'In Progress',
        resident: resident2._id,
        assignedCollector: 'E-Waste Rapid Team (Elena V.)',
        pointsAwarded: false,
        statusHistory: [
          { status: 'Pending', updatedBy: resident2._id, note: 'Report created', timestamp: new Date(Date.now() - 3 * 86400000) },
          { status: 'Approved', updatedBy: admin._id, note: 'E-waste flagged for specialized handling', timestamp: new Date(Date.now() - 2 * 86400000) },
          { status: 'In Progress', updatedBy: admin._id, note: 'Specialized vehicle on route', timestamp: new Date(Date.now() - 1 * 86400000) }
        ],
        createdAt: new Date(Date.now() - 3 * 86400000)
      },
      {
        title: 'Broken Glass Bottles along Bike Path',
        category: 'glass',
        description: 'Shattered beverage bottles along the bicycle trail poses hazard to cyclists and pedestrians.',
        location: 'Riverside Greenway Bike Path, Mile Marker 4',
        urgency: 'critical',
        status: 'Assigned',
        resident: resident3._id,
        assignedCollector: 'Trail Maintenance Crew B',
        pointsAwarded: false,
        statusHistory: [
          { status: 'Pending', updatedBy: resident3._id, note: 'Urgent hazard report submitted', timestamp: new Date(Date.now() - 2 * 86400000) },
          { status: 'Approved', updatedBy: admin._id, note: 'Escalated due to public safety hazard', timestamp: new Date(Date.now() - 1 * 86400000) },
          { status: 'Assigned', updatedBy: admin._id, note: 'Assigned to Trail Maintenance Crew B', timestamp: new Date() }
        ],
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        title: 'Cardboard Boxes Stack Behind Supermarket',
        category: 'paper',
        description: 'Clean flattened corrugated shipping boxes left out in the alley before rain arrives.',
        location: 'Rear Loading Dock, Elmwood Market',
        urgency: 'medium',
        status: 'Pending',
        resident: resident1._id,
        statusHistory: [
          { status: 'Pending', updatedBy: resident1._id, note: 'Report submitted by resident', timestamp: new Date() }
        ],
        createdAt: new Date()
      },
      {
        title: 'Accumulated Yard Waste and Hedge Trimmings',
        category: 'organic',
        description: 'Large pile of garden trimmings, leaves, and pruned branches needing composting pickup.',
        location: 'Corner of Maple Ave and 4th Street',
        urgency: 'low',
        status: 'Approved',
        resident: resident2._id,
        statusHistory: [
          { status: 'Pending', updatedBy: resident2._id, note: 'Report submitted', timestamp: new Date(Date.now() - 1 * 86400000) },
          { status: 'Approved', updatedBy: admin._id, note: 'Approved for bi-weekly compost truck', timestamp: new Date() }
        ],
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ]);

    console.log(`📋 Created ${reports.length} sample waste reports across various categories and lifecycle statuses`);

    // 4. Create Sample Pickup Requests
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);

    const pickups = await PickupRequest.insertMany([
      {
        resident: resident1._id,
        category: 'electronic',
        address: '742 Evergreen Terrace, Springfield',
        preferredDate: tomorrow,
        timeSlot: '08:00 AM - 11:00 AM',
        instructions: 'Please ring bell; items are in garage (2 laptops, 1 printer).',
        status: 'Approved',
        assignedCollector: 'E-Waste Recovery Unit',
        notes: 'Scheduled for morning route'
      },
      {
        resident: resident3._id,
        category: 'plastic',
        address: '22 Riverbank Lane, Oakville',
        preferredDate: nextWeek,
        timeSlot: '11:00 AM - 02:00 PM',
        instructions: 'Five large clear bags of sorted HDPE and PET containers.',
        status: 'In Progress',
        assignedCollector: 'Recycle Hauler #2',
        notes: 'Crew en route'
      },
      {
        resident: resident2._id,
        category: 'paper',
        address: '104 Pinecrest Boulevard, Greenfield',
        preferredDate: nextWeek,
        timeSlot: '02:00 PM - 05:00 PM',
        instructions: 'Old textbook bundles tied with natural twine on front porch.',
        status: 'Pending',
        notes: ''
      }
    ]);

    console.log(`🚛 Created ${pickups.length} sample pickup requests`);

    // 5. Create Sample Reward Transactions
    await RewardTransaction.insertMany([
      {
        resident: resident1._id,
        points: 30,
        type: 'waste_report',
        referenceId: reports[0]._id,
        referenceType: 'WasteReport',
        description: 'Earned 30 points for verified plastic waste report (#0001)'
      },
      {
        resident: resident1._id,
        points: 25,
        type: 'pickup_collection',
        referenceType: 'PickupRequest',
        description: 'Earned 25 points for completed scheduled pickup'
      },
      {
        resident: resident3._id,
        points: 50,
        type: 'waste_report',
        referenceType: 'WasteReport',
        description: 'Earned 50 points for electronic recycling verification'
      },
      {
        resident: resident3._id,
        points: 25,
        type: 'bonus',
        referenceType: 'Manual',
        description: 'Community Eco Hero monthly participation bonus'
      }
    ]);

    console.log('🏆 Created sample reward ledger entries');
    console.log('\n======================================================');
    console.log('✅ EcoTrack database seeded successfully!');
    console.log('   Administrator Account:');
    console.log(`     Email:    ${admin.email}`);
    console.log('     Password: AdminPassword123!');
    console.log('   Sample Resident Account:');
    console.log(`     Email:    ${resident1.email}`);
    console.log('     Password: Password123!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedDatabase();
