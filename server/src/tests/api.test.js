import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';

describe.sequential('EcoTrack API Test Suite', () => {
  let residentToken;
  let residentUser;
  let secondResidentToken;
  let secondResidentUser;
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Clear collections cleanly before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Create Resident 1
    const resRes1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Resident',
        email: 'jane@example.com',
        password: 'Password123!',
        phone: '1234567890',
        address: '123 Green St'
      });
    residentToken = resRes1.body.token;
    residentUser = resRes1.body.user;

    // Create Resident 2
    const resRes2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Resident',
        email: 'bob@example.com',
        password: 'Password123!'
      });
    secondResidentToken = resRes2.body.token;
    secondResidentUser = resRes2.body.user;

    // Create Admin user
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword123!'
      });
    adminToken = adminLogin.body.token;
  });

  describe('Health Check API', () => {
    it('GET /api/health - should return 200 with status healthy', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBeDefined();
    });
  });

  describe('Authentication & Authorization', () => {
    it('POST /api/auth/register - should fail on duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Duplicate',
          email: 'jane@example.com',
          password: 'Password123!'
        });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('POST /api/auth/register - should strictly prevent self-assigning admin role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'Password123!',
          role: 'admin'
        });
      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('resident');
    });

    it('POST /api/auth/login - should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'WrongPassword'
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me - should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/dashboard - should deny access to normal residents (403)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${residentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/dashboard - should allow access to administrators (200)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
    });
  });

  describe('Waste Reports Module', () => {
    it('POST /api/reports - should validate required fields and category', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          title: 'Hi',
          category: 'invalid_category',
          description: 'Short',
          location: ''
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/reports - should create report with Pending status', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          title: 'Plastic Bottles in Park',
          category: 'plastic',
          description: 'Large pile of single-use bottles near fountain.',
          location: 'Greenfield Central Park',
          urgency: 'high'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.report.status).toBe('Pending');
      expect(res.body.report.statusHistory).toHaveLength(1);
    });

    it('Report Ownership - resident B cannot view or edit resident A report', async () => {
      const createRes = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          title: 'Resident A Private Report',
          category: 'glass',
          description: 'Broken glass in driveway.',
          location: '123 Private St'
        });

      expect(createRes.status).toBe(201);
      const reportId = createRes.body.report._id;

      // Resident B tries to view Resident A report -> 403 Forbidden
      const viewRes = await request(app)
        .get(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${secondResidentToken}`);
      expect(viewRes.status).toBe(403);

      // Resident B tries to edit Resident A report -> 403 Forbidden
      const editRes = await request(app)
        .patch(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${secondResidentToken}`)
        .send({ title: 'Tampered Title' });
      expect(editRes.status).toBe(403);
    });

    it('Status Transition Rules - resident cannot delete a non-pending report', async () => {
      const createRes = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          title: 'Paper Waste Report',
          category: 'paper',
          description: 'Stacks of cardboard by building.',
          location: '77 Paper Mill Rd'
        });

      expect(createRes.status).toBe(201);
      const reportId = createRes.body.report._id;

      // Admin updates status to Approved
      await request(app)
        .patch(`/api/admin/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Approved', note: 'Approved by dispatch' });

      // Resident attempts to delete Approved report -> 400 Bad Request
      const deleteRes = await request(app)
        .delete(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${residentToken}`);
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.message).toMatch(/only pending reports/i);
    });
  });

  describe('Pickup Requests Module', () => {
    it('POST /api/pickups - should schedule new pickup', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);

      const res = await request(app)
        .post('/api/pickups')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          category: 'electronic',
          address: '123 Green St',
          preferredDate: tomorrow.toISOString(),
          timeSlot: '08:00 AM - 11:00 AM',
          instructions: 'Old PC components'
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.pickup.status).toBe('Pending');
    });
  });

  describe('Rewards & Duplication Prevention', () => {
    it('Admin completes report -> awards reward points and prevents duplicate reward', async () => {
      const createRes = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          title: 'Verified Electronic Cleanup',
          category: 'electronic',
          description: 'E-waste collected and sorted.',
          location: '12 Tech Hub Ave',
          urgency: 'high'
        });

      expect(createRes.status).toBe(201);
      const reportId = createRes.body.report._id;

      // Admin completes report
      const completeRes = await request(app)
        .patch(`/api/admin/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Completed',
          note: 'Recycling verified and sorted at facility.'
        });
      expect(completeRes.status).toBe(200);
      expect(completeRes.body.rewardResult.awarded).toBe(true);
      expect(completeRes.body.rewardResult.points).toBeGreaterThan(0);

      // Verify resident received points
      const residentMe = await request(app)
        .get('/api/rewards/me')
        .set('Authorization', `Bearer ${residentToken}`);
      expect(residentMe.body.points).toBeGreaterThan(0);
      expect(residentMe.body.transactions).toHaveLength(1);

      // Admin updates status again -> MUST NOT duplicate points
      const secondUpdate = await request(app)
        .patch(`/api/admin/reports/${reportId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Completed',
          note: 'Re-confirming completion.'
        });
      expect(secondUpdate.status).toBe(200);

      const residentMeAfter = await request(app)
        .get('/api/rewards/me')
        .set('Authorization', `Bearer ${residentToken}`);
      expect(residentMeAfter.body.transactions).toHaveLength(1);
    });

    it('GET /api/rewards/leaderboard - should return rankings', async () => {
      const res = await request(app).get('/api/rewards/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.leaderboard)).toBe(true);
    });
  });
});
