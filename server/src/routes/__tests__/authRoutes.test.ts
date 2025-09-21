import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from '../authRoutes';
import User from '@/models/User';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 for invalid username', async () => {
      const userData = {
        username: 'te', // Too short
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 400 for short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123' // Too short
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 409 for duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const duplicateData = {
        username: 'testuser', // Same username
        email: 'different@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/auth/register')
        .send(duplicateData)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
    });

    it('should login with username successfully', async () => {
      const loginData = {
        usernameOrEmail: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.token).toBeDefined();
    });

    it('should login with email successfully', async () => {
      const loginData = {
        usernameOrEmail: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 for invalid username', async () => {
      const loginData = {
        usernameOrEmail: 'nonexistent',
        password: 'password123'
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        usernameOrEmail: 'testuser',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should return 400 for missing credentials', async () => {
      await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .expect(200);

      expect(response.body.message).toBe('Token refreshed successfully');
    });
  });
});